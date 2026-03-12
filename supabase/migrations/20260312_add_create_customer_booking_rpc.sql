create sequence if not exists public.customer_code_seq;

alter table public.customers
alter column customer_code set default (
  'CUST-' || lpad(nextval('public.customer_code_seq')::text, 4, '0')
);

create or replace function public.create_customer_booking(payload jsonb)
returns jsonb
language plpgsql
security invoker
as $$
declare
  new_customer_id uuid;
  new_booking_id uuid;
  new_pet_id uuid;
  boarder jsonb;
  extra_item jsonb;
  generated_customer_code text;
begin
  insert into public.customers (
    name,
    email,
    phone,
    address_line_1,
    town_city,
    postcode,
    emergency_contact_name,
    emergency_contact_phone,
    status,
    created_by
  )
  values (
    nullif(trim(payload #>> '{customer,name}'), ''),
    nullif(trim(payload #>> '{customer,email}'), ''),
    nullif(trim(payload #>> '{customer,phone}'), ''),
    nullif(trim(payload #>> '{customer,addressLine1}'), ''),
    nullif(trim(payload #>> '{customer,townCity}'), ''),
    nullif(trim(payload #>> '{customer,postcode}'), ''),
    nullif(trim(payload #>> '{customer,emergencyContactName}'), ''),
    nullif(trim(payload #>> '{customer,emergencyContactPhone}'), ''),
    coalesce(nullif(payload #>> '{customer,status}', ''), 'New')::public.customer_status,
    auth.uid()
  )
  returning id, customer_code into new_customer_id, generated_customer_code;

  insert into public.bookings (
    customer_id,
    arrival_date,
    departure_date,
    boarders_booked,
    days_inclusive,
    booking_notes,
    grooming_amount,
    pickup_delivery_amount,
    medication_amount,
    vets_fees_amount,
    training_amount,
    total_extras_amount,
    total_daily_rate,
    total_days,
    discount_amount,
    extras_amount,
    subtotal_amount,
    vat_percent,
    total_amount,
    amount_paid,
    balance_owed,
    created_by
  )
  values (
    new_customer_id,
    (payload #>> '{booking,arrivalDate}')::date,
    (payload #>> '{booking,departureDate}')::date,
    coalesce(nullif(payload #>> '{booking,boardersBooked}', ''), '0')::integer,
    nullif(payload #>> '{booking,daysInclusive}', '')::integer,
    nullif(trim(payload #>> '{booking,bookingNotes}'), ''),
    coalesce(nullif(payload #>> '{extras,grooming}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{extras,pickupDelivery}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{extras,medication}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{extras,vetsFees}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{extras,training}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{extras,totalExtras}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{billing,totalDailyRate}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{billing,totalDays}', ''), '0')::integer,
    coalesce(nullif(payload #>> '{billing,discount}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{billing,extras}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{billing,subtotal}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{billing,vatPercent}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{billing,total}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{billing,amountPaid}', ''), '0')::numeric,
    coalesce(nullif(payload #>> '{billing,balanceOwed}', ''), '0')::numeric,
    auth.uid()
  )
  returning id into new_booking_id;

  for boarder in
    select value
    from jsonb_array_elements(coalesce(payload -> 'boarders', '[]'::jsonb))
  loop
    if coalesce(trim(boarder ->> 'name'), '') = '' then
      continue;
    end if;

    insert into public.pets (
      customer_id,
      name,
      breed_description,
      age_years,
      medications,
      special_diet,
      comments,
      vaccination_date,
      kennel_cough_date,
      default_daily_rate
    )
    values (
      new_customer_id,
      trim(boarder ->> 'name'),
      nullif(trim(boarder ->> 'description'), ''),
      nullif(boarder ->> 'age', '')::integer,
      nullif(trim(boarder ->> 'medications'), ''),
      nullif(trim(boarder ->> 'specialDiet'), ''),
      nullif(trim(boarder ->> 'comments'), ''),
      case
        when coalesce(boarder ->> 'vaccinationDate', '') = '' then null
        else to_date(boarder ->> 'vaccinationDate', 'YYYY-MM')
      end,
      case
        when coalesce(boarder ->> 'kennelCoughDate', '') = '' then null
        else to_date(boarder ->> 'kennelCoughDate', 'YYYY-MM')
      end,
      coalesce(nullif(boarder ->> 'dailyRate', ''), '0')::numeric
    )
    returning id into new_pet_id;

    insert into public.booking_pets (
      booking_id,
      pet_id,
      daily_rate,
      medications,
      special_diet,
      comments
    )
    values (
      new_booking_id,
      new_pet_id,
      coalesce(nullif(boarder ->> 'dailyRate', ''), '0')::numeric,
      nullif(trim(boarder ->> 'medications'), ''),
      nullif(trim(boarder ->> 'specialDiet'), ''),
      nullif(trim(boarder ->> 'comments'), '')
    );
  end loop;

  for extra_item in
    select value
    from jsonb_array_elements(coalesce(payload -> 'extraItems', '[]'::jsonb))
  loop
    insert into public.booking_extras (
      booking_id,
      label,
      amount
    )
    values (
      new_booking_id,
      coalesce(nullif(trim(extra_item ->> 'label'), ''), 'Extra'),
      coalesce(nullif(extra_item ->> 'amount', ''), '0')::numeric
    );
  end loop;

  return jsonb_build_object(
    'customer_id', new_customer_id,
    'booking_id', new_booking_id,
    'customer_code', generated_customer_code
  );
end;
$$;

grant execute on function public.create_customer_booking(jsonb) to authenticated;