create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'customer_status'
  ) then
    create type public.customer_status as enum ('New', 'Active', 'Returning');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  customer_code text not null unique,
  name text not null,
  email text,
  phone text,
  address_line_1 text,
  town_city text,
  postcode text,
  emergency_contact_name text,
  emergency_contact_phone text,
  status public.customer_status not null default 'New',
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  name text not null,
  breed_description text,
  age_years integer,
  medications text,
  special_diet text,
  comments text,
  vaccination_date date,
  kennel_cough_date date,
  default_daily_rate numeric(10, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  arrival_date date not null,
  departure_date date not null,
  boarders_booked integer not null default 0,
  days_inclusive integer,
  booking_notes text,
  grooming_amount numeric(10, 2) not null default 0,
  pickup_delivery_amount numeric(10, 2) not null default 0,
  medication_amount numeric(10, 2) not null default 0,
  vets_fees_amount numeric(10, 2) not null default 0,
  training_amount numeric(10, 2) not null default 0,
  total_extras_amount numeric(10, 2) not null default 0,
  total_daily_rate numeric(10, 2) not null default 0,
  total_days integer not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  extras_amount numeric(10, 2) not null default 0,
  subtotal_amount numeric(10, 2) not null default 0,
  vat_percent numeric(5, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  amount_paid numeric(10, 2) not null default 0,
  balance_owed numeric(10, 2) not null default 0,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bookings_dates_check check (departure_date >= arrival_date),
  constraint bookings_boarders_check check (boarders_booked >= 0),
  constraint bookings_total_days_check check (total_days >= 0),
  constraint bookings_days_inclusive_check check (days_inclusive is null or days_inclusive >= 0)
);

create table if not exists public.booking_pets (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  daily_rate numeric(10, 2) not null default 0,
  medications text,
  special_diet text,
  comments text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (booking_id, pet_id)
);

create table if not exists public.booking_extras (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  label text not null,
  amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists customers_name_idx on public.customers (name);
create index if not exists customers_email_idx on public.customers (email);
create index if not exists pets_customer_id_idx on public.pets (customer_id);
create index if not exists bookings_customer_id_idx on public.bookings (customer_id);
create index if not exists bookings_arrival_date_idx on public.bookings (arrival_date);
create index if not exists booking_pets_booking_id_idx on public.booking_pets (booking_id);
create index if not exists booking_extras_booking_id_idx on public.booking_extras (booking_id);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

drop trigger if exists pets_set_updated_at on public.pets;
create trigger pets_set_updated_at
before update on public.pets
for each row
execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.pets enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_pets enable row level security;
alter table public.booking_extras enable row level security;

drop policy if exists "Authenticated users can view customers" on public.customers;
create policy "Authenticated users can view customers"
on public.customers
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert customers" on public.customers;
create policy "Authenticated users can insert customers"
on public.customers
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update customers" on public.customers;
create policy "Authenticated users can update customers"
on public.customers
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete customers" on public.customers;
create policy "Authenticated users can delete customers"
on public.customers
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can view pets" on public.pets;
create policy "Authenticated users can view pets"
on public.pets
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert pets" on public.pets;
create policy "Authenticated users can insert pets"
on public.pets
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update pets" on public.pets;
create policy "Authenticated users can update pets"
on public.pets
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete pets" on public.pets;
create policy "Authenticated users can delete pets"
on public.pets
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can view bookings" on public.bookings;
create policy "Authenticated users can view bookings"
on public.bookings
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert bookings" on public.bookings;
create policy "Authenticated users can insert bookings"
on public.bookings
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update bookings" on public.bookings;
create policy "Authenticated users can update bookings"
on public.bookings
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete bookings" on public.bookings;
create policy "Authenticated users can delete bookings"
on public.bookings
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can view booking pets" on public.booking_pets;
create policy "Authenticated users can view booking pets"
on public.booking_pets
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert booking pets" on public.booking_pets;
create policy "Authenticated users can insert booking pets"
on public.booking_pets
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update booking pets" on public.booking_pets;
create policy "Authenticated users can update booking pets"
on public.booking_pets
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete booking pets" on public.booking_pets;
create policy "Authenticated users can delete booking pets"
on public.booking_pets
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can view booking extras" on public.booking_extras;
create policy "Authenticated users can view booking extras"
on public.booking_extras
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert booking extras" on public.booking_extras;
create policy "Authenticated users can insert booking extras"
on public.booking_extras
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update booking extras" on public.booking_extras;
create policy "Authenticated users can update booking extras"
on public.booking_extras
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete booking extras" on public.booking_extras;
create policy "Authenticated users can delete booking extras"
on public.booking_extras
for delete
to authenticated
using (true);