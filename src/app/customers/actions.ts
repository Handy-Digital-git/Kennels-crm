"use server";

import { revalidatePath } from "next/cache";
import type { CustomerFormValues } from "@/lib/customer-form-schema";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export type CreateCustomerBookingInput = CustomerFormValues;

type UpdateVisitOptions = {
  currentVisitId?: string;
  originalArrivalDate?: string;
  originalDepartureDate?: string;
  originalAmountPaid?: string;
};

type DerivedBookingValues = {
  boardersBooked: number;
  daysInclusive: number;
  totalDailyRate: number;
  totalExtras: number;
  discount: number;
  vatPercent: number;
  subtotal: number;
  total: number;
  amountPaid: number;
  balanceOwed: number;
};

type PersistedPetSnapshot = {
  id: string;
  name: string;
  breedDescription: string | null;
  ageYears: number | null;
  vaccinationDate: string | null;
  kennelCoughDate: string | null;
  dailyRate: number;
  medications: string | null;
  specialDiet: string | null;
  comments: string | null;
};

type ActionErrorResult = {
  error: string;
};

type VisitMutationResult = {
  visitId: string;
};

function isMissingVetColumnError(message?: string | null) {
  return Boolean(
    message && /vet_name|vet_address|vet_contact_number/i.test(message),
  );
}

function buildCustomerPayload(input: CreateCustomerBookingInput, includeVetDetails: boolean) {
  return {
    name: input.customer.name,
    email: input.customer.email || null,
    phone: input.customer.phone || null,
    address_line_1: input.customer.addressLine1 || null,
    town_city: input.customer.townCity || null,
    postcode: input.customer.postcode || null,
    emergency_contact_name: input.customer.emergencyContactName || null,
    emergency_contact_phone: input.customer.emergencyContactPhone || null,
    ...(includeVetDetails
      ? {
          vet_name: input.vetDetails.vetName || null,
          vet_address: input.vetDetails.vetAddress || null,
          vet_contact_number: input.vetDetails.vetContactNumber || null,
        }
      : {}),
    status: input.customer.status,
  };
}

function parseAmount(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getInclusiveDays(arrivalDate: string, departureDate: string) {
  if (!arrivalDate || !departureDate) {
    return 0;
  }

  const arrival = new Date(`${arrivalDate}T00:00:00Z`);
  const departure = new Date(`${departureDate}T00:00:00Z`);

  if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime())) {
    return 0;
  }

  const difference = Math.floor(
    (departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24),
  );

  return difference >= 0 ? difference + 1 : 0;
}

function monthToDate(value: string) {
  return value ? value.slice(0, 10) : null;
}

function formatMoneyInput(value: string | number | null | undefined) {
  return parseAmount(value).toFixed(2);
}

function getVisitInputForSave(
  input: CreateCustomerBookingInput,
  options: UpdateVisitOptions,
  shouldCreateNewVisit: boolean,
) {
  if (!shouldCreateNewVisit) {
    return input;
  }

  const originalAmountPaid = formatMoneyInput(options.originalAmountPaid);
  const nextAmountPaid = formatMoneyInput(input.billing.amountPaid);

  if (nextAmountPaid !== originalAmountPaid) {
    return input;
  }

  return {
    ...input,
    billing: {
      ...input.billing,
      amountPaid: "0.00",
    },
  };
}

function getDerivedBookingValues(
  input: CreateCustomerBookingInput,
  boarders: CreateCustomerBookingInput["boarders"],
): DerivedBookingValues {
  const boardersBooked = boarders.length;
  const daysInclusive = getInclusiveDays(
    input.booking.arrivalDate,
    input.booking.departureDate,
  );
  const totalDailyRate = boarders.reduce(
    (sum, boarder) => sum + parseAmount(boarder.dailyRate),
    0,
  );
  const totalExtras =
    parseAmount(input.extras.grooming) +
    parseAmount(input.extras.pickupDelivery) +
    parseAmount(input.extras.medication) +
    parseAmount(input.extras.vetsFees) +
    parseAmount(input.extras.training);
  const discount = parseAmount(input.billing.discount);
  const vatPercent = parseAmount(input.billing.vatPercent);
  const amountPaid = parseAmount(input.billing.amountPaid);
  const subtotal = Math.max(0, totalDailyRate * daysInclusive + totalExtras - discount);
  const total = subtotal + subtotal * (vatPercent / 100);
  const balanceOwed = Math.max(0, total - amountPaid);

  return {
    boardersBooked,
    daysInclusive,
    totalDailyRate,
    totalExtras,
    discount,
    vatPercent,
    subtotal,
    total,
    amountPaid,
    balanceOwed,
  };
}

async function getAuthedClient() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to save a customer." as const };
  }

  return { supabase, user };
}

function validateInput(input: CreateCustomerBookingInput) {
  const boarders = input.boarders.filter((boarder) => boarder.name.trim().length > 0);

  if (!input.customer.name.trim()) {
    return { error: "Customer name is required." };
  }

  if (!input.booking.arrivalDate || !input.booking.departureDate) {
    return { error: "Arrival and departure dates are required." };
  }

  if (boarders.length === 0) {
    return { error: "Add at least one boarder before saving." };
  }

  return { boarders };
}

async function persistCustomerPets(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  customerId: string,
  boarders: CreateCustomerBookingInput["boarders"],
) {
  const { data: existingPets, error: existingPetsError } = await supabase
    .from("pets")
    .select("id")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true });

  if (existingPetsError) {
    return { error: existingPetsError.message };
  }

  const persistedPets: PersistedPetSnapshot[] = [];

  for (const [index, boarder] of boarders.entries()) {
    const petPayload = {
      customer_id: customerId,
      name: boarder.name,
      breed_description: boarder.description || null,
      age_years: boarder.age ? Number(boarder.age) : null,
      medications: boarder.medications || null,
      special_diet: boarder.specialDiet || null,
      comments: boarder.comments || null,
      vaccination_date: monthToDate(boarder.vaccinationDate),
      kennel_cough_date: monthToDate(boarder.kennelCoughDate),
      default_daily_rate: parseAmount(boarder.dailyRate),
    };

    const existingPet = existingPets?.[index];

    if (existingPet) {
      const { error: updatePetError } = await supabase
        .from("pets")
        .update(petPayload)
        .eq("id", existingPet.id);

      if (updatePetError) {
        return { error: updatePetError.message };
      }

      persistedPets.push({
        id: existingPet.id,
        name: boarder.name,
        breedDescription: petPayload.breed_description,
        ageYears: petPayload.age_years,
        vaccinationDate: petPayload.vaccination_date,
        kennelCoughDate: petPayload.kennel_cough_date,
        dailyRate: petPayload.default_daily_rate,
        medications: petPayload.medications,
        specialDiet: petPayload.special_diet,
        comments: petPayload.comments,
      });
    } else {
      const { data: insertedPet, error: insertPetError } = await supabase
        .from("pets")
        .insert(petPayload)
        .select("id")
        .single();

      if (insertPetError || !insertedPet) {
        return { error: insertPetError?.message ?? "Failed to create pet." };
      }

      persistedPets.push({
        id: insertedPet.id,
        name: boarder.name,
        breedDescription: petPayload.breed_description,
        ageYears: petPayload.age_years,
        vaccinationDate: petPayload.vaccination_date,
        kennelCoughDate: petPayload.kennel_cough_date,
        dailyRate: petPayload.default_daily_rate,
        medications: petPayload.medications,
        specialDiet: petPayload.special_diet,
        comments: petPayload.comments,
      });
    }
  }

  return { persistedPets };
}

async function replaceVisitSnapshots(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  visitId: string,
  boarders: PersistedPetSnapshot[],
  input: CreateCustomerBookingInput,
): Promise<{ success: true } | ActionErrorResult> {
  const { error: deleteVisitPetsError } = await supabase
    .from("visit_pets")
    .delete()
    .eq("visit_id", visitId);

  if (deleteVisitPetsError) {
    return { error: deleteVisitPetsError.message };
  }

  const visitPetsPayload = boarders.map((boarder) => ({
    visit_id: visitId,
    pet_id: boarder.id,
    pet_name: boarder.name,
    breed_description: boarder.breedDescription,
    age_years: boarder.ageYears,
    vaccination_date: boarder.vaccinationDate,
    kennel_cough_date: boarder.kennelCoughDate,
    daily_rate: boarder.dailyRate,
    medications: boarder.medications,
    special_diet: boarder.specialDiet,
    comments: boarder.comments,
  }));

  if (visitPetsPayload.length > 0) {
    const { error: insertVisitPetsError } = await supabase
      .from("visit_pets")
      .insert(visitPetsPayload);

    if (insertVisitPetsError) {
      return { error: insertVisitPetsError.message };
    }
  }

  const { error: deleteVisitExtrasError } = await supabase
    .from("visit_extras")
    .delete()
    .eq("visit_id", visitId);

  if (deleteVisitExtrasError) {
    return { error: deleteVisitExtrasError.message };
  }

  const { error: insertVisitExtrasError } = await supabase
    .from("visit_extras")
    .insert([
      { visit_id: visitId, label: "Grooming", amount: parseAmount(input.extras.grooming) },
      {
        visit_id: visitId,
        label: "Pickup / Delivery",
        amount: parseAmount(input.extras.pickupDelivery),
      },
      { visit_id: visitId, label: "Medication", amount: parseAmount(input.extras.medication) },
      { visit_id: visitId, label: "Vets Fees", amount: parseAmount(input.extras.vetsFees) },
      { visit_id: visitId, label: "Training", amount: parseAmount(input.extras.training) },
    ]);

  if (insertVisitExtrasError) {
    return { error: insertVisitExtrasError.message };
  }

  return { success: true as const };
}

async function createVisitRecord(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  customerId: string,
  boarders: PersistedPetSnapshot[],
  input: CreateCustomerBookingInput,
  derived: DerivedBookingValues,
): Promise<VisitMutationResult | ActionErrorResult> {
  const { data: insertedVisit, error: insertVisitError } = await supabase
    .from("visits")
    .insert({
      customer_id: customerId,
      status: "scheduled",
      arrival_date: input.booking.arrivalDate,
      departure_date: input.booking.departureDate,
      boarders_booked: derived.boardersBooked,
      days_inclusive: derived.daysInclusive,
      booking_notes: input.booking.bookingNotes || null,
      total_daily_rate: derived.totalDailyRate,
      total_extras_amount: derived.totalExtras,
      discount_amount: derived.discount,
      subtotal_amount: derived.subtotal,
      vat_percent: derived.vatPercent,
      total_amount: derived.total,
      amount_paid: derived.amountPaid,
      balance_owed: derived.balanceOwed,
    })
    .select("id")
    .single();

  if (insertVisitError || !insertedVisit) {
    return { error: insertVisitError?.message ?? "Failed to create visit." };
  }

  const snapshotsResult = await replaceVisitSnapshots(
    supabase,
    insertedVisit.id,
    boarders,
    input,
  );

  if ("error" in snapshotsResult) {
    return snapshotsResult;
  }

  return { visitId: insertedVisit.id };
}

async function updateVisitRecord(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  visitId: string,
  boarders: PersistedPetSnapshot[],
  input: CreateCustomerBookingInput,
  derived: DerivedBookingValues,
): Promise<VisitMutationResult | ActionErrorResult> {
  const { error: updateVisitError } = await supabase
    .from("visits")
    .update({
      arrival_date: input.booking.arrivalDate,
      departure_date: input.booking.departureDate,
      boarders_booked: derived.boardersBooked,
      days_inclusive: derived.daysInclusive,
      booking_notes: input.booking.bookingNotes || null,
      total_daily_rate: derived.totalDailyRate,
      total_extras_amount: derived.totalExtras,
      discount_amount: derived.discount,
      subtotal_amount: derived.subtotal,
      vat_percent: derived.vatPercent,
      total_amount: derived.total,
      amount_paid: derived.amountPaid,
      balance_owed: derived.balanceOwed,
    })
    .eq("id", visitId);

  if (updateVisitError) {
    return { error: updateVisitError.message };
  }

  const snapshotsResult = await replaceVisitSnapshots(
    supabase,
    visitId,
    boarders,
    input,
  );

  if ("error" in snapshotsResult) {
    return snapshotsResult;
  }

  return { visitId };
}

async function lookupCustomer(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  identifier: string,
) {
  let customerLookup = await supabase
    .from("customers")
    .select("id, customer_code")
    .eq("customer_code", identifier)
    .maybeSingle();

  if (!customerLookup.data && /^[0-9a-f-]{36}$/i.test(identifier)) {
    customerLookup = await supabase
      .from("customers")
      .select("id, customer_code")
      .eq("id", identifier)
      .maybeSingle();
  }

  if (customerLookup.error || !customerLookup.data) {
    return { error: "Customer record not found." };
  }

  return {
    customerId: customerLookup.data.id,
    customerCode: customerLookup.data.customer_code ?? identifier,
  };
}

export async function createCustomerBooking(input: CreateCustomerBookingInput) {
  const authResult = await getAuthedClient();

  if ("error" in authResult) {
    return authResult;
  }

  const validation = validateInput(input);

  if ("error" in validation) {
    return validation;
  }

  const { supabase } = authResult;
  const { boarders } = validation;
  const derived = getDerivedBookingValues(input, boarders);

  let insertCustomerResult = await supabase
    .from("customers")
    .insert(buildCustomerPayload(input, true))
    .select("id, customer_code")
    .single();

  if (insertCustomerResult.error && isMissingVetColumnError(insertCustomerResult.error.message)) {
    insertCustomerResult = await supabase
      .from("customers")
      .insert(buildCustomerPayload(input, false))
      .select("id, customer_code")
      .single();
  }

  const { data: insertedCustomer, error: insertCustomerError } = insertCustomerResult;

  if (insertCustomerError || !insertedCustomer) {
    return { error: insertCustomerError?.message ?? "Failed to create customer." };
  }

  const persistedPetsResult = await persistCustomerPets(
    supabase,
    insertedCustomer.id,
    boarders,
  );

  if ("error" in persistedPetsResult) {
    return persistedPetsResult;
  }

  const visitResult = await createVisitRecord(
    supabase,
    insertedCustomer.id,
    persistedPetsResult.persistedPets,
    input,
    derived,
  );

  if ("error" in visitResult) {
    return visitResult;
  }

  revalidatePath("/customers");
  revalidatePath("/customers/new");
  revalidatePath(`/customers/${insertedCustomer.customer_code}`);
  revalidatePath("/visits");

  return {
    success: true as const,
    customerCode: insertedCustomer.customer_code,
    visitId: visitResult.visitId,
  };
}

export async function updateCustomerBooking(
  identifier: string,
  input: CreateCustomerBookingInput,
  options: UpdateVisitOptions = {},
) {
  const authResult = await getAuthedClient();

  if ("error" in authResult) {
    return authResult;
  }

  const validation = validateInput(input);

  if ("error" in validation) {
    return validation;
  }

  const { supabase } = authResult;
  const { boarders } = validation;
  const derived = getDerivedBookingValues(input, boarders);

  const customerLookup = await lookupCustomer(supabase, identifier);

  if ("error" in customerLookup) {
    return customerLookup;
  }

  const { customerId, customerCode } = customerLookup;

  let customerUpdateResult = await supabase
    .from("customers")
    .update(buildCustomerPayload(input, true))
    .eq("id", customerId);

  if (customerUpdateResult.error && isMissingVetColumnError(customerUpdateResult.error.message)) {
    customerUpdateResult = await supabase
      .from("customers")
      .update(buildCustomerPayload(input, false))
      .eq("id", customerId);
  }

  const { error: customerError } = customerUpdateResult;

  if (customerError) {
    return { error: customerError.message };
  }

  const persistedPetsResult = await persistCustomerPets(supabase, customerId, boarders);

  if ("error" in persistedPetsResult) {
    return persistedPetsResult;
  }

  const shouldCreateNewVisit =
    !options.currentVisitId ||
    input.booking.arrivalDate !== options.originalArrivalDate ||
    input.booking.departureDate !== options.originalDepartureDate;

  const visitInput = getVisitInputForSave(input, options, shouldCreateNewVisit);
  const visitDerived = getDerivedBookingValues(visitInput, boarders);

  const visitResult = shouldCreateNewVisit
    ? await createVisitRecord(
        supabase,
        customerId,
        persistedPetsResult.persistedPets,
        visitInput,
        visitDerived,
      )
    : await updateVisitRecord(
        supabase,
        options.currentVisitId!,
        persistedPetsResult.persistedPets,
        visitInput,
        visitDerived,
      );

  if ("error" in visitResult) {
    return visitResult;
  }

  const visitId = shouldCreateNewVisit ? visitResult.visitId : options.currentVisitId!;

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerCode}`);
  revalidatePath(`/visits/${visitId}`);
  revalidatePath("/visits");

  return { success: true as const, customerCode, visitId };
}

export async function settleVisitBill(visitId: string, amountPaid: string) {
  const authResult = await getAuthedClient();

  if ("error" in authResult) {
    return authResult;
  }

  const { supabase } = authResult;
  const paidAmount = parseAmount(amountPaid);

  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("id, customer_id, total_amount")
    .eq("id", visitId)
    .maybeSingle();

  if (visitError || !visit) {
    return { error: visitError?.message ?? "Visit not found." };
  }

  const totalAmount = parseAmount(visit.total_amount);
  const balanceOwed = Math.max(0, totalAmount - paidAmount);

  const { error: updateVisitError } = await supabase
    .from("visits")
    .update({
      amount_paid: paidAmount,
      balance_owed: balanceOwed,
    })
    .eq("id", visitId);

  if (updateVisitError) {
    return { error: updateVisitError.message };
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("customer_code")
    .eq("id", visit.customer_id)
    .maybeSingle();

  revalidatePath("/customers");
  revalidatePath("/visits");
  revalidatePath(`/visits/${visitId}`);

  if (customer?.customer_code) {
    revalidatePath(`/customers/${customer.customer_code}`);
  }

  return { success: true as const, balanceOwed };
}

export async function deleteVisit(visitId: string) {
  const authResult = await getAuthedClient();

  if ("error" in authResult) {
    return authResult;
  }

  const { supabase } = authResult;

  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("id, customer_id")
    .eq("id", visitId)
    .maybeSingle();

  if (visitError || !visit) {
    return { error: visitError?.message ?? "Visit not found." };
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("customer_code")
    .eq("id", visit.customer_id)
    .maybeSingle();

  const { error: deleteError } = await supabase
    .from("visits")
    .delete()
    .eq("id", visitId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/customers");
  revalidatePath("/visits");

  if (customer?.customer_code) {
    revalidatePath(`/customers/${customer.customer_code}`);
  }

  return {
    success: true as const,
    customerCode: customer?.customer_code ?? null,
  };
}

export async function deletePet(petId: string) {
  const authResult = await getAuthedClient();

  if ("error" in authResult) {
    return authResult;
  }

  const { supabase } = authResult;

  const { data: pet, error: petError } = await supabase
    .from("pets")
    .select("id, customer_id")
    .eq("id", petId)
    .maybeSingle();

  if (petError || !pet) {
    return { error: petError?.message ?? "Pet not found." };
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("customer_code")
    .eq("id", pet.customer_id)
    .maybeSingle();

  const { error: deleteError } = await supabase
    .from("pets")
    .delete()
    .eq("id", petId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/pets");
  revalidatePath("/customers");

  if (customer?.customer_code) {
    revalidatePath(`/customers/${customer.customer_code}`);
  }

  return {
    success: true as const,
    customerCode: customer?.customer_code ?? null,
  };
}