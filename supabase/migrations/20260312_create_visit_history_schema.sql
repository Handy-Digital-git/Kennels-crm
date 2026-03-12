do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'visit_status'
  ) then
    create type public.visit_status as enum (
      'scheduled',
      'checked_in',
      'completed',
      'cancelled'
    );
  end if;
end
$$;

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  legacy_booking_id uuid unique references public.bookings (id) on delete set null,
  status public.visit_status not null default 'scheduled',
  arrival_date date not null,
  departure_date date not null,
  boarders_booked integer not null default 0,
  days_inclusive integer not null default 0,
  booking_notes text,
  total_daily_rate numeric(10, 2) not null default 0,
  total_extras_amount numeric(10, 2) not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  subtotal_amount numeric(10, 2) not null default 0,
  vat_percent numeric(5, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  amount_paid numeric(10, 2) not null default 0,
  balance_owed numeric(10, 2) not null default 0,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint visits_dates_check check (departure_date >= arrival_date),
  constraint visits_boarders_check check (boarders_booked >= 0),
  constraint visits_days_check check (days_inclusive >= 0)
);

create table if not exists public.visit_pets (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete set null,
  pet_name text not null,
  breed_description text,
  age_years integer,
  vaccination_date date,
  kennel_cough_date date,
  daily_rate numeric(10, 2) not null default 0,
  medications text,
  special_diet text,
  comments text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.visit_extras (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits (id) on delete cascade,
  label text not null,
  amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists visits_customer_id_idx on public.visits (customer_id);
create index if not exists visits_arrival_date_idx on public.visits (arrival_date);
create index if not exists visits_status_idx on public.visits (status);
create index if not exists visit_pets_visit_id_idx on public.visit_pets (visit_id);
create index if not exists visit_extras_visit_id_idx on public.visit_extras (visit_id);

drop trigger if exists visits_set_updated_at on public.visits;
create trigger visits_set_updated_at
before update on public.visits
for each row
execute function public.set_updated_at();

alter table public.visits enable row level security;
alter table public.visit_pets enable row level security;
alter table public.visit_extras enable row level security;

drop policy if exists "Authenticated users can view visits" on public.visits;
create policy "Authenticated users can view visits"
on public.visits
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert visits" on public.visits;
create policy "Authenticated users can insert visits"
on public.visits
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update visits" on public.visits;
create policy "Authenticated users can update visits"
on public.visits
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete visits" on public.visits;
create policy "Authenticated users can delete visits"
on public.visits
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can view visit pets" on public.visit_pets;
create policy "Authenticated users can view visit pets"
on public.visit_pets
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert visit pets" on public.visit_pets;
create policy "Authenticated users can insert visit pets"
on public.visit_pets
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update visit pets" on public.visit_pets;
create policy "Authenticated users can update visit pets"
on public.visit_pets
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete visit pets" on public.visit_pets;
create policy "Authenticated users can delete visit pets"
on public.visit_pets
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can view visit extras" on public.visit_extras;
create policy "Authenticated users can view visit extras"
on public.visit_extras
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert visit extras" on public.visit_extras;
create policy "Authenticated users can insert visit extras"
on public.visit_extras
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update visit extras" on public.visit_extras;
create policy "Authenticated users can update visit extras"
on public.visit_extras
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete visit extras" on public.visit_extras;
create policy "Authenticated users can delete visit extras"
on public.visit_extras
for delete
to authenticated
using (true);

insert into public.visits (
  customer_id,
  legacy_booking_id,
  status,
  arrival_date,
  departure_date,
  boarders_booked,
  days_inclusive,
  booking_notes,
  total_daily_rate,
  total_extras_amount,
  discount_amount,
  subtotal_amount,
  vat_percent,
  total_amount,
  amount_paid,
  balance_owed,
  created_by,
  created_at,
  updated_at
)
select
  b.customer_id,
  b.id,
  case
    when b.departure_date < current_date then 'completed'::public.visit_status
    else 'scheduled'::public.visit_status
  end,
  b.arrival_date,
  b.departure_date,
  b.boarders_booked,
  coalesce(nullif(b.days_inclusive, 0), b.total_days),
  b.booking_notes,
  b.total_daily_rate,
  b.total_extras_amount,
  b.discount_amount,
  b.subtotal_amount,
  b.vat_percent,
  b.total_amount,
  b.amount_paid,
  b.balance_owed,
  b.created_by,
  b.created_at,
  b.updated_at
from public.bookings b
where not exists (
  select 1
  from public.visits v
  where v.legacy_booking_id = b.id
);

insert into public.visit_pets (
  visit_id,
  pet_id,
  pet_name,
  breed_description,
  age_years,
  vaccination_date,
  kennel_cough_date,
  daily_rate,
  medications,
  special_diet,
  comments,
  created_at
)
select
  v.id,
  bp.pet_id,
  p.name,
  p.breed_description,
  p.age_years,
  p.vaccination_date,
  p.kennel_cough_date,
  bp.daily_rate,
  bp.medications,
  bp.special_diet,
  bp.comments,
  bp.created_at
from public.booking_pets bp
join public.visits v on v.legacy_booking_id = bp.booking_id
left join public.pets p on p.id = bp.pet_id
where not exists (
  select 1
  from public.visit_pets vp
  where vp.visit_id = v.id
    and coalesce(vp.pet_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(bp.pet_id, '00000000-0000-0000-0000-000000000000'::uuid)
    and vp.pet_name = coalesce(p.name, vp.pet_name)
);

insert into public.visit_extras (
  visit_id,
  label,
  amount,
  created_at
)
select
  v.id,
  be.label,
  be.amount,
  be.created_at
from public.booking_extras be
join public.visits v on v.legacy_booking_id = be.booking_id
where not exists (
  select 1
  from public.visit_extras ve
  where ve.visit_id = v.id
    and ve.label = be.label
    and ve.amount = be.amount
);