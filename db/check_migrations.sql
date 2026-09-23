-- Which migrations are actually applied? Run in the Supabase SQL editor.
-- Each row checks one object that migration creates; false = not applied.
-- (021 only changes a default value, so it has no object to check.)
with checks(migration, kind, tbl, name) as (values
  ('002', 'col', 'trips', 'custom_cash_value'),
  ('003', 'tbl', 'itineraries', null),
  ('004', 'col', 'profiles', 'reminder_unsubscribe_token'),
  ('005', 'fn', null, 'delete_own_account'),
  ('006', 'col', 'contracts', 'points_remaining'),
  ('007', 'tbl', 'contract_year_points', null),
  ('008', 'tbl', 'user_badges', null),
  ('009', 'fn', null, 'badge_rarity_stats'),
  ('010', 'fn', null, 'increment_badge_event'),
  ('011', 'col', 'profiles', 'push_subscription'),
  ('012', 'col', 'trips', 'points_source_breakdown'),
  ('013', 'col', 'contracts', 'blue_card_override'),
  ('014', 'tbl', 'subscriptions', null),
  ('015', 'col', 'contract_year_points', 'points_holding'),
  ('016', 'col', 'contract_year_points',
          'points_holding_entered_at'),
  ('017', 'tbl', 'reminder_run_log', null),
  ('018', 'col', 'profiles', 'point_value_baseline'),
  ('019', 'fn', null, 'validate_trip_funding'),
  ('020', 'col', 'contract_year_points',
          'balance_confirmed_at'),
  ('022', 'fn', null, 'record_point_movement'),
  ('023', 'col', 'itineraries', 'booking_contract_id'),
  ('024', 'fn', null, 'save_trip_booking'),
  ('025', 'fn', null, 'reconcile_points'),
  ('026', 'col', 'profiles', 'holding_reminder_lead_days'),
  ('027', 'tbl', 'waitlists', null),
  ('027', 'tbl', 'booking_cancellations', null),
  ('027', 'col', 'trips', 'disney_confirmation_number')
)
select
  migration,
  concat_ws('.', tbl, name) as object,
  case kind
    when 'col' then exists (
      select 1
      from information_schema.columns as c
      where c.table_schema = 'public'
        and c.table_name = checks.tbl
        and c.column_name = checks.name)
    when 'tbl' then exists (
      select 1
      from information_schema.tables as t
      where t.table_schema = 'public'
        and t.table_name = checks.tbl)
    when 'fn' then exists (
      select 1
      from pg_proc as p
      join pg_namespace as n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = checks.name)
  end as present
from checks
order by migration;
