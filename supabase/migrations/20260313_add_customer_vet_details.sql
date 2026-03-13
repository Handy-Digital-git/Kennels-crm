alter table public.customers
add column if not exists vet_name text,
add column if not exists vet_address text,
add column if not exists vet_contact_number text;