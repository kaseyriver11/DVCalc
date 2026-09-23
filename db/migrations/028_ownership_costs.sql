-- Run once in the Supabase SQL editor (2026-09-23). db/schema.sql already
-- includes this for a fresh install.
--
-- Prompt 6: owner-entered actual ownership costs for Membership Value.
-- One row per contract per cost: annual dues paid (by calendar year),
-- one-time acquisition closing costs (year null), and optional financing
-- interest paid (by calendar year). contracts.purchase_price stays the
-- purchase principal -- loan principal is never entered again here.
-- No row means "use the app's estimate" (published dues rate, estimated
-- closing cost); a saved 0 is an intentional actual zero.
create table if not exists public.ownership_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  kind text not null check (kind in ('dues', 'closing', 'interest')),
  year integer,
  amount numeric(12,2) not null check (amount >= 0 and amount <= 10000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ownership_costs_year_by_kind check (
    (kind = 'closing' and year is null) or (kind <> 'closing' and year between 1980 and 2100))
);
create unique index if not exists ownership_costs_one_per_year
  on public.ownership_costs(contract_id, kind, coalesce(year, 0));
alter table public.ownership_costs enable row level security;
drop policy if exists "Read own ownership costs" on public.ownership_costs;
create policy "Read own ownership costs" on public.ownership_costs for select to authenticated using (user_id = auth.uid());
grant select on public.ownership_costs to authenticated;
-- No insert/update/delete grants: writes go through save_ownership_costs().

-- Apply one contract's changed actuals in one transaction.
--   p_entries: [{kind, year, amount}] -- amount null removes that actual
--   (back to the estimate); 0 is kept as an actual zero.
-- Setting a value is idempotent, so a retry after a lost response lands on
-- the same figures. Any invalid entry rejects the whole save.
create or replace function public.save_ownership_costs(p_contract uuid, p_entries jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  owner_id uuid := auth.uid();
  e jsonb;
  k text;
  y integer;
  amt numeric;
begin
  if owner_id is null then raise exception 'Sign in to save costs.'; end if;
  if not exists (select 1 from public.contracts where id = p_contract and user_id = owner_id) then
    raise exception 'Contract not found.';
  end if;
  if jsonb_typeof(p_entries) <> 'array' then raise exception 'Invalid cost entries.'; end if;
  for e in select value from jsonb_array_elements(p_entries) loop
    k := e->>'kind';
    y := nullif(e->>'year', '')::integer;
    amt := nullif(e->>'amount', '')::numeric;
    if k not in ('dues', 'closing', 'interest') then raise exception 'Invalid cost kind.'; end if;
    if (k = 'closing') <> (y is null) or (y is not null and y not between 1980 and 2100) then raise exception 'Invalid cost year.'; end if;
    if amt is not null and (amt < 0 or amt > 10000000 or amt <> round(amt, 2)) then
      raise exception 'Enter an amount of zero or more, to the cent.';
    end if;
    if amt is null then
      delete from public.ownership_costs where contract_id = p_contract and kind = k and coalesce(year, 0) = coalesce(y, 0);
    else
      insert into public.ownership_costs(user_id, contract_id, kind, year, amount)
      values (owner_id, p_contract, k, y, amt)
      on conflict (contract_id, kind, (coalesce(year, 0))) do update set amount = excluded.amount, updated_at = now();
    end if;
  end loop;
  return coalesce((select jsonb_agg(to_jsonb(c)) from public.ownership_costs c where c.contract_id = p_contract), '[]'::jsonb);
end;
$$;
revoke all on function public.save_ownership_costs(uuid, jsonb) from public;
grant execute on function public.save_ownership_costs(uuid, jsonb) to authenticated;

notify pgrst, 'reload schema';
