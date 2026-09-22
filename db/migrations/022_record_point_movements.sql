-- Requires 020. One transaction updates both years and records a retry key.
create table if not exists public.point_movements (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  kind text not null check (kind in ('bank','borrow')),
  from_year integer not null,
  to_year integer not null,
  points integer not null check (points > 0),
  result jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.point_movements enable row level security;
drop policy if exists "Read own point movements" on public.point_movements;
create policy "Read own point movements" on public.point_movements for select to authenticated using (user_id = auth.uid());
grant select on public.point_movements to authenticated;

create or replace function public.record_point_movement(
  p_id uuid, p_contract uuid, p_kind text, p_year integer, p_points integer,
  p_expected_from jsonb, p_expected_to jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  owner_id uuid := auth.uid();
  from_year integer;
  to_year integer;
  source public.contract_year_points%rowtype;
  destination public.contract_year_points%rowtype;
  previous public.point_movements%rowtype;
  result jsonb;
begin
  if owner_id is null then raise exception 'Sign in to record points.'; end if;
  if p_id is null or p_kind not in ('bank','borrow') or p_kind is null or p_points is null or p_points <= 0 or p_year is null or p_year not between 1900 and 9998 then
    raise exception 'Invalid point movement.';
  end if;
  -- Serialize retries before checking the durable receipt.
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  select * into previous from public.point_movements where id = p_id;
  if found then
    if previous.user_id <> owner_id or previous.contract_id <> p_contract or previous.kind <> p_kind or previous.points <> p_points or least(previous.from_year, previous.to_year) <> p_year then
      raise exception 'This save reference belongs to a different movement.';
    end if;
    return previous.result;
  end if;
  if not exists (select 1 from public.contracts where id = p_contract and user_id = owner_id) then
    raise exception 'Contract not found.';
  end if;
  from_year := case when p_kind = 'bank' then p_year else p_year + 1 end;
  to_year := case when p_kind = 'bank' then p_year + 1 else p_year end;
  -- Lock in year order, including against ordinary balance corrections.
  perform 1 from public.contract_year_points where contract_id = p_contract and user_id = owner_id and use_year_label in (from_year,to_year) order by use_year_label for update;
  select * into source from public.contract_year_points where contract_id = p_contract and user_id = owner_id and use_year_label = from_year;
  select * into destination from public.contract_year_points where contract_id = p_contract and user_id = owner_id and use_year_label = to_year;
  if source.balance_confirmed_at is null or destination.balance_confirmed_at is null then
    raise exception 'Add both year balances before recording a move.';
  end if;
  if (to_jsonb(source) -> 'updated_at') is distinct from (p_expected_from -> 'updated_at') or
     (to_jsonb(destination) -> 'updated_at') is distinct from (p_expected_to -> 'updated_at') or
     jsonb_build_array(source.points_remaining,source.points_banked,source.points_borrowed,source.points_holding,source.balance_confirmed_at) is distinct from
     jsonb_build_array(p_expected_from->'points_remaining',p_expected_from->'points_banked',p_expected_from->'points_borrowed',p_expected_from->'points_holding',p_expected_from->'balance_confirmed_at') or
     jsonb_build_array(destination.points_remaining,destination.points_banked,destination.points_borrowed,destination.points_holding,destination.balance_confirmed_at) is distinct from
     jsonb_build_array(p_expected_to->'points_remaining',p_expected_to->'points_banked',p_expected_to->'points_borrowed',p_expected_to->'points_holding',p_expected_to->'balance_confirmed_at') then
    raise exception 'Balances changed. Close this sheet and review the latest balances before trying again.';
  end if;
  if source.points_remaining < p_points then raise exception 'Not enough current points in the source year.'; end if;
  update public.contract_year_points set points_remaining = points_remaining - p_points, balance_confirmed_at = now() where id = source.id returning * into source;
  update public.contract_year_points set
    points_banked = points_banked + case when p_kind = 'bank' then p_points else 0 end,
    points_borrowed = points_borrowed + case when p_kind = 'borrow' then p_points else 0 end,
    balance_confirmed_at = now()
    where id = destination.id returning * into destination;
  result := jsonb_build_object('from',to_jsonb(source),'to',to_jsonb(destination));
  insert into public.point_movements(id,user_id,contract_id,kind,from_year,to_year,points,result)
    values(p_id,owner_id,p_contract,p_kind,from_year,to_year,p_points,result);
  return result;
end;
$$;
revoke all on function public.record_point_movement(uuid,uuid,text,integer,integer,jsonb,jsonb) from public;
grant execute on function public.record_point_movement(uuid,uuid,text,integer,integer,jsonb,jsonb) to authenticated;
