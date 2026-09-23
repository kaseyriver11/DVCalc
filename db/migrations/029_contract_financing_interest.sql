-- Run once in the Supabase SQL editor (2026-09-23). db/schema.sql already
-- includes this for a fresh install.
--
-- An optional owner estimate of financing interest paid to date on a
-- contract (Add/Edit Contract). Membership Value adds it to what ownership
-- has cost so far. The purchase price is the amount financed plus closing,
-- so this is interest only -- loan principal is never counted twice.
alter table public.contracts
  add column if not exists financing_interest_paid numeric(12,2);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'contracts_financing_interest_paid_check') then
    alter table public.contracts add constraint contracts_financing_interest_paid_check
      check (financing_interest_paid >= 0 and financing_interest_paid <= 10000000);
  end if;
end $$;

notify pgrst, 'reload schema';
