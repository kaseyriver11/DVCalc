-- Owner-led "Reconcile points" (Prompt 2, docs/owner_problem_research_2026-09-23.md).
-- The owner compares a contract/use-year's recorded buckets with what they
-- see on Disney's member site and either marks it checked (match) or
-- corrects it with a reason. DVC Companion never reads Disney; every event
-- here is owner-entered.
-- Requires 015 (points_holding), 016 (points_holding_entered_at), 020
-- (balance_confirmed_at). Same retry/conflict shape as 022's
-- record_point_movement.

-- When the owner last compared this row with Disney. Separate from
-- balance_confirmed_at (when a balance was entered at all): existing rows
-- start null and read "Not checked against Disney yet" -- nothing inherits
-- an unproven verification.
alter table public.contract_year_points
  add column if not exists last_checked_against_disney_at timestamptz;

-- Immutable reconciliation events. Written only by reconcile_points().
create table if not exists public.point_reconciliations (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  use_year_label integer not null,
  matched boolean not null,
  reason text check (reason in ('booking', 'banking', 'borrowing', 'transfer', 'cancellation', 'other')),
  notes text check (char_length(notes) <= 500),
  before jsonb,           -- the recorded buckets the owner compared (null: no balance recorded)
  after jsonb not null,   -- the Disney amounts the owner entered
  created_at timestamptz not null default now(),
  constraint point_reconciliations_reason_when_changed check (matched or reason is not null)
);
create index if not exists point_reconciliations_contract_idx on public.point_reconciliations(contract_id, use_year_label);
alter table public.point_reconciliations enable row level security;
drop policy if exists "Read own point reconciliations" on public.point_reconciliations;
create policy "Read own point reconciliations" on public.point_reconciliations for select to authenticated using (user_id = auth.uid());
grant select on public.point_reconciliations to authenticated;
-- No insert/update/delete grants: events are immutable and written by the function below.

-- p_id        client-generated retry key (a repeated Save returns the first result)
-- p_expected  the row as the sheet read it ({updated_at, points_*, balance_confirmed_at}),
--             or null when no balance row existed. Any difference means a booking
--             deduction, point move or other edit landed since: nothing is written.
-- p_after     {points_remaining, points_banked, points_borrowed, points_holding}
--             as the owner reads them on Disney's site
-- p_reason    required unless p_after equals the recorded buckets
create or replace function public.reconcile_points(
  p_id uuid, p_contract uuid, p_year integer, p_expected jsonb, p_after jsonb, p_reason text, p_notes text
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  owner_id uuid := auth.uid();
  previous public.point_reconciliations%rowtype;
  current_row public.contract_year_points%rowtype;
  saved public.contract_year_points%rowtype;
  had_row boolean;
  a_remaining integer; a_banked integer; a_borrowed integer; a_holding integer;
  before_json jsonb;
  is_match boolean;
  today date := (now() at time zone 'America/New_York')::date;
begin
  if owner_id is null then raise exception 'Sign in to reconcile points.'; end if;
  if p_id is null or p_contract is null or p_year is null or p_year not between 2000 and 2100 or p_after is null then
    raise exception 'Invalid reconciliation.';
  end if;
  begin
    a_remaining := (p_after->>'points_remaining')::integer;
    a_banked := (p_after->>'points_banked')::integer;
    a_borrowed := (p_after->>'points_borrowed')::integer;
    a_holding := (p_after->>'points_holding')::integer;
  exception when others then
    raise exception 'Enter whole numbers of points.';
  end;
  if a_remaining is null or a_banked is null or a_borrowed is null or a_holding is null
     or least(a_remaining, a_banked, a_borrowed, a_holding) < 0 then
    raise exception 'Enter whole numbers of points, zero or more.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  select * into previous from public.point_reconciliations where id = p_id;
  if found then
    if previous.user_id <> owner_id or previous.contract_id <> p_contract or previous.use_year_label <> p_year then
      raise exception 'This save reference belongs to a different reconciliation.';
    end if;
    select * into saved from public.contract_year_points where contract_id = p_contract and use_year_label = p_year;
    return jsonb_build_object('row', to_jsonb(saved), 'event', to_jsonb(previous), 'retried', true);
  end if;

  if not exists (select 1 from public.contracts where id = p_contract and user_id = owner_id) then
    raise exception 'Contract not found.';
  end if;

  select * into current_row from public.contract_year_points
    where contract_id = p_contract and user_id = owner_id and use_year_label = p_year for update;
  had_row := found;
  if (had_row and p_expected is null) or (not had_row and p_expected is not null) or (had_row and (
       (to_jsonb(current_row) -> 'updated_at') is distinct from (p_expected -> 'updated_at') or
       jsonb_build_array(current_row.points_remaining, current_row.points_banked, current_row.points_borrowed, current_row.points_holding, current_row.balance_confirmed_at)
         is distinct from
       jsonb_build_array(p_expected->'points_remaining', p_expected->'points_banked', p_expected->'points_borrowed', p_expected->'points_holding', p_expected->'balance_confirmed_at'))) then
    raise exception 'Balances changed. Review the latest balance before saving.';
  end if;

  before_json := case when had_row and current_row.balance_confirmed_at is not null then jsonb_build_object(
    'points_remaining', current_row.points_remaining, 'points_banked', current_row.points_banked,
    'points_borrowed', current_row.points_borrowed, 'points_holding', current_row.points_holding) end;
  is_match := before_json is not null and before_json = jsonb_build_object(
    'points_remaining', a_remaining, 'points_banked', a_banked, 'points_borrowed', a_borrowed, 'points_holding', a_holding);
  if not is_match and (p_reason is null or p_reason not in ('booking', 'banking', 'borrowing', 'transfer', 'cancellation', 'other')) then
    raise exception 'Choose why the balance changed.';
  end if;

  if had_row then
    update public.contract_year_points set
      points_remaining = a_remaining, points_banked = a_banked, points_borrowed = a_borrowed, points_holding = a_holding,
      points_holding_entered_at = case when a_holding > 0 then coalesce(points_holding_entered_at, today) else null end,
      balance_confirmed_at = case when is_match then balance_confirmed_at else now() end,
      last_checked_against_disney_at = now()
      where id = current_row.id returning * into saved;
  else
    insert into public.contract_year_points(user_id, contract_id, use_year_label, points_remaining, points_banked, points_borrowed, points_holding,
      points_holding_entered_at, balance_confirmed_at, last_checked_against_disney_at)
    values (owner_id, p_contract, p_year, a_remaining, a_banked, a_borrowed, a_holding,
      case when a_holding > 0 then today end, now(), now())
    returning * into saved;
  end if;

  insert into public.point_reconciliations(id, user_id, contract_id, use_year_label, matched, reason, notes, before, after)
  values (p_id, owner_id, p_contract, p_year, is_match, case when is_match then null else p_reason end,
    nullif(left(coalesce(p_notes, ''), 500), ''), before_json,
    jsonb_build_object('points_remaining', a_remaining, 'points_banked', a_banked, 'points_borrowed', a_borrowed, 'points_holding', a_holding))
  returning * into previous;

  return jsonb_build_object('row', to_jsonb(saved), 'event', to_jsonb(previous), 'retried', false);
end;
$$;
revoke all on function public.reconcile_points(uuid,uuid,integer,jsonb,jsonb,text,text) from public;
grant execute on function public.reconcile_points(uuid,uuid,integer,jsonb,jsonb,text,text) to authenticated;

-- Activity view reads: trip_deductions (024) include reversed receipts so the
-- timeline can show both the deduction and its reversal.
