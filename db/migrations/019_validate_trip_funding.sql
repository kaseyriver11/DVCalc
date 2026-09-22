-- Confirmed trip funding is attribution, not a point-ledger transaction.
-- Legacy records remain readable and require confirmation in the app.
create or replace function public.validate_trip_funding()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  funding jsonb := new.points_source_breakdown;
  allocation jsonb;
  source_key text;
  source_points numeric;
  assigned numeric := 0;
  contract_ids uuid[] := array[]::uuid[];
  source_contract uuid;
begin
  if coalesce(funding->>'version', '') <> '2' then
    if TG_OP = 'UPDATE' then
      if old.points_source_breakdown->>'version' = '2' then
        raise exception 'Confirmed trip point sources cannot be removed. Review and save all sources.';
      end if;
    end if;
    return new;
  end if;
  if jsonb_typeof(funding->'version') is distinct from 'number'
     or jsonb_typeof(funding->'allocations') is distinct from 'array'
     or new.points_used is null or new.points_used <= 0 then
    raise exception 'Enter valid trip point sources and positive points used.';
  end if;
  for allocation in select value from jsonb_array_elements(funding->'allocations') loop
    if jsonb_typeof(allocation->'points') is distinct from 'number' then
      raise exception 'Contract points must be positive whole numbers.';
    end if;
    source_points := (allocation->>'points')::numeric;
    if source_points <= 0 or source_points <> trunc(source_points) then
      raise exception 'Contract points must be positive whole numbers.';
    end if;
    source_contract := (allocation->>'contract_id')::uuid;
    if source_contract is null or not exists (
      select 1 from public.contracts where id = source_contract and user_id = new.user_id
    ) then
      raise exception 'Each point allocation must belong to one of your contracts.';
    end if;
    if source_contract = any(contract_ids) then
      raise exception 'Each contract can appear only once.';
    end if;
    contract_ids := array_append(contract_ids, source_contract);
    assigned := assigned + source_points;
  end loop;
  foreach source_key in array array['one_time', 'transferred', 'other'] loop
    if jsonb_typeof(funding->source_key) is distinct from 'number' then
      raise exception 'Outside points must be zero or positive whole numbers.';
    end if;
    source_points := (funding->>source_key)::numeric;
    if source_points < 0 or source_points <> trunc(source_points) then
      raise exception 'Outside points must be zero or positive whole numbers.';
    end if;
    assigned := assigned + source_points;
  end loop;
  if assigned <> new.points_used then
    raise exception 'Point sources must total the points used for this trip.';
  end if;
  new.contract_id := case when cardinality(contract_ids) = 1 then contract_ids[1] else null end;
  return new;
end;
$$;

drop trigger if exists validate_trip_funding on public.trips;
create trigger validate_trip_funding
before insert or update of points_source_breakdown, points_used, user_id on public.trips
for each row execute function public.validate_trip_funding();
