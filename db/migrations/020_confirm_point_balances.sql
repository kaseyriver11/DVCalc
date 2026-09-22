-- Preserve existing saved balances. New rows remain unknown until the owner
-- supplies a balance; this timestamp records entry, not a Disney verification.
-- Backfill runs only when the column is first introduced, making reruns safe.
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='contract_year_points' and column_name='balance_confirmed_at') then
    alter table public.contract_year_points add column balance_confirmed_at timestamptz;
    update public.contract_year_points set balance_confirmed_at = coalesce(updated_at, now());
  end if;
end;
$$;
comment on column public.contract_year_points.balance_confirmed_at is
  'When the owner supplied the available balance for this use year. Null means not added; it is not zero or the annual allotment.';
