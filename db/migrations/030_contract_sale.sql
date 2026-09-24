-- Run once in the Supabase SQL editor (2026-09-24). db/schema.sql already
-- includes this for a fresh install.
--
-- When a contract was sold or otherwise ended, and what the owner got back
-- for it (net of broker fees), both optional and entered on Edit Contract.
-- Membership Value stops a contract's dues after its end year and subtracts
-- the proceeds from what ownership has cost. Before this, a deactivated
-- contract kept adding a year of dues every year.
alter table public.contracts
  add column if not exists ended_on date,
  add column if not exists sale_proceeds numeric(12,2);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'contracts_sale_proceeds_check') then
    alter table public.contracts add constraint contracts_sale_proceeds_check
      check (sale_proceeds >= 0 and sale_proceeds <= 10000000);
  end if;
end $$;

notify pgrst, 'reload schema';
