-- Planning context only; this does not book a stay or allocate/deduct points.
alter table public.itineraries add column if not exists booking_contract_id uuid
  references public.contracts(id) on delete set null;

create or replace function public.validate_itinerary_booking_contract()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if new.booking_contract_id is not null and not exists (
    select 1 from public.contracts where id = new.booking_contract_id and user_id = new.user_id
  ) then
    raise exception 'Choose one of your own contracts for Booking As.';
  end if;
  return new;
end;
$$;
drop trigger if exists itinerary_booking_contract_owner on public.itineraries;
create trigger itinerary_booking_contract_owner before insert or update on public.itineraries
for each row execute function public.validate_itinerary_booking_contract();
