import { customerRecords } from "@/lib/customer-data";
import {
  boarderTitles,
  emptyCustomerFormValues,
  type CustomerFormValues,
} from "@/lib/customer-form-schema";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export type VisitHistoryItem = {
  id: string;
  status: string;
  arrivalDate: string;
  departureDate: string;
  boarders: string[];
  totalAmount: number;
  amountPaid: number;
  balanceOwed: number;
  createdAt: string;
};

export type CustomerDetailRecord = {
  identifier: string;
  customerName: string;
  currentVisitId?: string;
  currentVisitDates?: {
    arrivalDate: string;
    departureDate: string;
  };
  initialValues: CustomerFormValues;
  visitHistory: VisitHistoryItem[];
};

export type VisitDetailRecord = {
  id: string;
  customerIdentifier: string;
  customerName: string;
  customerAddressLine1: string;
  customerTownCity: string;
  customerPostcode: string;
  customerPhone: string;
  customerEmail: string;
  status: string;
  arrivalDate: string;
  departureDate: string;
  boardersBooked: number;
  daysInclusive: number;
  bookingNotes: string;
  totalDailyRate: number;
  totalExtrasAmount: number;
  discountAmount: number;
  subtotalAmount: number;
  vatPercent: number;
  totalAmount: number;
  amountPaid: number;
  balanceOwed: number;
  boarders: Array<{
    petName: string;
    breedDescription: string;
    ageYears: number | null;
    vaccinationDate: string;
    kennelCoughDate: string;
    dailyRate: number;
    medications: string;
    specialDiet: string;
    comments: string;
  }>;
  extras: Array<{
    label: string;
    amount: number;
  }>;
};

export type PetListItem = {
  id: string;
  name: string;
  breedDescription: string;
  ownerName: string;
  ownerIdentifier: string;
  ageYears: number | null;
  medications: string;
  specialDiet: string;
  dailyRate: number;
  upcomingStay: string;
  status: string;
};

export type PetDetailRecord = {
  id: string;
  name: string;
  breedDescription: string;
  ownerName: string;
  ownerIdentifier: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerTownCity: string;
  ageYears: number | null;
  vaccinationDate: string;
  kennelCoughDate: string;
  medications: string;
  specialDiet: string;
  comments: string;
  dailyRate: number;
  upcomingStay: string;
  stayHistory: Array<{
    visitId: string;
    arrivalDate: string;
    departureDate: string;
    status: string;
    dailyRate: number;
    medications: string;
    specialDiet: string;
    comments: string;
  }>;
};

function toMoneyString(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return "0.00";
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue.toFixed(2) : "0.00";
}

function toCountString(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? String(numberValue) : "0";
}

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function toNumber(value?: number | string | null) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function toDisplayDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(arrivalDate?: string | null, departureDate?: string | null) {
  if (!arrivalDate || !departureDate) {
    return "No booking scheduled";
  }

  const arrival = new Date(`${arrivalDate}T00:00:00`);
  const departure = new Date(`${departureDate}T00:00:00`);

  if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime())) {
    return "No booking scheduled";
  }

  return `${arrival.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} - ${departure.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function createMockPetId(name: string) {
  return `pet-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

function formatStatusLabel(status?: string | null) {
  switch (status) {
    case "checked_in":
      return "Checked In";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Scheduled";
  }
}

function isMissingVetColumnError(message?: string | null) {
  return Boolean(
    message && /vet_name|vet_address|vet_contact_number/i.test(message),
  );
}

function getRelatedPet(
  pet:
    | {
        name?: string | null;
        breed_description?: string | null;
        age_years?: number | null;
        vaccination_date?: string | null;
        kennel_cough_date?: string | null;
      }
    | Array<{
        name?: string | null;
        breed_description?: string | null;
        age_years?: number | null;
        vaccination_date?: string | null;
        kennel_cough_date?: string | null;
      }>
    | null
    | undefined,
) {
  return Array.isArray(pet) ? (pet[0] ?? null) : pet;
}

function normalizeBoarders(
  boarders: CustomerFormValues["boarders"],
): CustomerFormValues["boarders"] {
  const nextBoarders = boarders.slice(0, boarderTitles.length);

  while (nextBoarders.length < boarderTitles.length) {
    nextBoarders.push({ ...emptyCustomerFormValues.boarders[0] });
  }

  return nextBoarders;
}

function buildMockCustomerDetail(identifier: string): CustomerDetailRecord | null {
  const customer = customerRecords.find((record) => record.id === identifier);

  if (!customer) {
    return null;
  }

  return {
    identifier: customer.id,
    customerName: customer.name,
    currentVisitId: `${customer.id}-visit-1`,
    currentVisitDates: {
      arrivalDate: "",
      departureDate: "",
    },
    initialValues: {
      ...emptyCustomerFormValues,
      customer: {
        ...emptyCustomerFormValues.customer,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        townCity: customer.town,
        status: customer.status,
      },
      booking: {
        ...emptyCustomerFormValues.booking,
        boardersBooked: String(customer.boarders.length),
        daysInclusive: String(customer.nights),
      },
      boarders: normalizeBoarders(
        customer.boarders.map((name) => ({
          ...emptyCustomerFormValues.boarders[0],
          name,
        })),
      ),
      billing: {
        ...emptyCustomerFormValues.billing,
        total: toMoneyString(customer.balanceDue),
        balanceOwed: toMoneyString(customer.balanceDue),
      },
    },
    visitHistory: [
      {
        id: `${customer.id}-visit-1`,
        status: customer.nights > 0 ? "Completed" : "Scheduled",
        arrivalDate: "",
        departureDate: "",
        boarders: customer.boarders,
        totalAmount: customer.balanceDue,
        amountPaid: 0,
        balanceOwed: customer.balanceDue,
        createdAt: "",
      },
    ],
  };
}

function buildMockPetListItems(): PetListItem[] {
  return customerRecords.flatMap((customer) =>
    customer.boarders.map((boarder, index) => ({
      id: createMockPetId(boarder),
      name: boarder,
      breedDescription: index % 3 === 0 ? "Springer Spaniel" : index % 3 === 1 ? "Sprocker" : "Labrador Cross",
      ownerName: customer.name,
      ownerIdentifier: customer.id,
      ageYears: index + 2,
      medications: index % 2 === 0 ? "None recorded" : "Daily tablet with breakfast",
      specialDiet: index % 2 === 0 ? "Standard kennel food" : "Owner food twice daily",
      dailyRate: 24,
      upcomingStay: customer.upcomingStay,
      status: customer.status,
    })),
  );
}

function buildMockPetDetailRecord(identifier: string): PetDetailRecord | null {
  const pet = buildMockPetListItems().find((item) => item.id === identifier);

  if (!pet) {
    return null;
  }

  const customer = customerRecords.find((record) => record.id === pet.ownerIdentifier);

  if (!customer) {
    return null;
  }

  return {
    id: pet.id,
    name: pet.name,
    breedDescription: pet.breedDescription,
    ownerName: customer.name,
    ownerIdentifier: customer.id,
    ownerPhone: customer.phone,
    ownerEmail: customer.email,
    ownerTownCity: customer.town,
    ageYears: pet.ageYears,
    vaccinationDate: "12 Mar 2025",
    kennelCoughDate: "18 Jan 2026",
    medications: pet.medications,
    specialDiet: pet.specialDiet,
    comments: "Settles quickly after evening walk and prefers a quiet kennel position.",
    dailyRate: pet.dailyRate,
    upcomingStay: pet.upcomingStay,
    stayHistory:
      pet.upcomingStay === "No booking scheduled"
        ? []
        : [
            {
              visitId: `${customer.id}-visit-1`,
              arrivalDate: "2026-03-14",
              departureDate: "2026-03-18",
              status: "Scheduled",
              dailyRate: pet.dailyRate,
              medications: pet.medications,
              specialDiet: pet.specialDiet,
              comments: "Keep bedding from home in kennel overnight.",
            },
          ],
  };
}

function buildInitialValuesFromVisit(args: {
  customer: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address_line_1?: string | null;
    town_city?: string | null;
    postcode?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    vet_name?: string | null;
    vet_address?: string | null;
    vet_contact_number?: string | null;
    status?: "Active" | "New" | "Returning" | null;
  };
  visit?: {
    arrival_date?: string | null;
    departure_date?: string | null;
    boarders_booked?: number | null;
    days_inclusive?: number | null;
    booking_notes?: string | null;
    total_daily_rate?: number | null;
    total_extras_amount?: number | null;
    discount_amount?: number | null;
    vat_percent?: number | null;
    total_amount?: number | null;
    amount_paid?: number | null;
    balance_owed?: number | null;
  } | null;
  visitPets: Array<{
    pet_name?: string | null;
    breed_description?: string | null;
    age_years?: number | null;
    daily_rate?: number | null;
    medications?: string | null;
    special_diet?: string | null;
    comments?: string | null;
    vaccination_date?: string | null;
    kennel_cough_date?: string | null;
  }>;
}) {
  return {
    customer: {
      name: args.customer.name ?? "",
      email: args.customer.email ?? "",
      phone: args.customer.phone ?? "",
      addressLine1: args.customer.address_line_1 ?? "",
      townCity: args.customer.town_city ?? "",
      postcode: args.customer.postcode ?? "",
      emergencyContactName: args.customer.emergency_contact_name ?? "",
      emergencyContactPhone: args.customer.emergency_contact_phone ?? "",
      status: args.customer.status ?? "New",
    },
    booking: {
      arrivalDate: toDateInput(args.visit?.arrival_date),
      departureDate: toDateInput(args.visit?.departure_date),
      boardersBooked: toCountString(args.visit?.boarders_booked),
      daysInclusive: toCountString(args.visit?.days_inclusive),
      bookingNotes: args.visit?.booking_notes ?? "",
    },
    vetDetails: {
      vetName: args.customer.vet_name ?? "",
      vetAddress: args.customer.vet_address ?? "",
      vetContactNumber: args.customer.vet_contact_number ?? "",
    },
    boarders: normalizeBoarders(
      args.visitPets.map((visitPet) => ({
        name: visitPet.pet_name ?? "",
        description: visitPet.breed_description ?? "",
        age: visitPet.age_years ? String(visitPet.age_years) : "",
        medications: visitPet.medications ?? "",
        specialDiet: visitPet.special_diet ?? "",
        comments: visitPet.comments ?? "",
        vaccinationDate: toDateInput(visitPet.vaccination_date),
        kennelCoughDate: toDateInput(visitPet.kennel_cough_date),
        dailyRate: toMoneyString(visitPet.daily_rate),
      })),
    ),
    extras: {
      grooming: "0.00",
      pickupDelivery: "0.00",
      medication: "0.00",
      vetsFees: "0.00",
      training: "0.00",
      totalExtras: toMoneyString(args.visit?.total_extras_amount),
    },
    billing: {
      totalDailyRate: toMoneyString(args.visit?.total_daily_rate),
      totalDays: toCountString(args.visit?.days_inclusive),
      discount: toMoneyString(args.visit?.discount_amount),
      extras: toMoneyString(args.visit?.total_extras_amount),
      subtotal: toMoneyString(args.visit ? toNumber(args.visit.total_amount) - (toNumber(args.visit.total_amount) * (toNumber(args.visit.vat_percent) / (100 + toNumber(args.visit.vat_percent || 0)))) : 0),
      vatPercent: toMoneyString(args.visit?.vat_percent),
      total: toMoneyString(args.visit?.total_amount),
      amountPaid: toMoneyString(args.visit?.amount_paid),
      balanceOwed: toMoneyString(args.visit?.balance_owed),
    },
  } satisfies CustomerFormValues;
}

async function loadVisitsForCustomer(customerId: string) {
  const supabase = await getSupabaseServerClient();
  const { data: visits } = await supabase
    .from("visits")
    .select(
      "id, status, arrival_date, departure_date, boarders_booked, days_inclusive, booking_notes, total_daily_rate, total_extras_amount, discount_amount, vat_percent, total_amount, amount_paid, balance_owed, created_at",
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return visits ?? [];
}

export async function getCustomerDetailRecord(
  identifier: string,
): Promise<CustomerDetailRecord | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return buildMockCustomerDetail(identifier);
  }

  try {
    const supabase = await getSupabaseServerClient();

    const customerSelectWithVetFields =
      "id, customer_code, name, email, phone, address_line_1, town_city, postcode, emergency_contact_name, emergency_contact_phone, vet_name, vet_address, vet_contact_number, status";
    const customerSelectWithoutVetFields =
      "id, customer_code, name, email, phone, address_line_1, town_city, postcode, emergency_contact_name, emergency_contact_phone, status";

    let customerResponse = await supabase
      .from("customers")
      .select(customerSelectWithVetFields)
      .eq("customer_code", identifier)
      .maybeSingle();

    if (customerResponse.error && isMissingVetColumnError(customerResponse.error.message)) {
      customerResponse = await supabase
        .from("customers")
        .select(customerSelectWithoutVetFields)
        .eq("customer_code", identifier)
        .maybeSingle();
    }

    if (!customerResponse.data && /^[0-9a-f-]{36}$/i.test(identifier)) {
      customerResponse = await supabase
        .from("customers")
        .select(customerSelectWithVetFields)
        .eq("id", identifier)
        .maybeSingle();

      if (customerResponse.error && isMissingVetColumnError(customerResponse.error.message)) {
        customerResponse = await supabase
          .from("customers")
          .select(customerSelectWithoutVetFields)
          .eq("id", identifier)
          .maybeSingle();
      }
    }

    if (customerResponse.error || !customerResponse.data) {
      return buildMockCustomerDetail(identifier);
    }

    const customer = customerResponse.data;
    const visits = await loadVisitsForCustomer(customer.id);

    if (visits.length > 0) {
      const visitIds = visits.map((visit) => visit.id);
      const [{ data: visitPets }, { data: visitExtras }] = await Promise.all([
        supabase
          .from("visit_pets")
          .select(
            "visit_id, pet_name, breed_description, age_years, vaccination_date, kennel_cough_date, daily_rate, medications, special_diet, comments",
          )
          .in("visit_id", visitIds),
        supabase
          .from("visit_extras")
          .select("visit_id, label, amount")
          .in("visit_id", visitIds),
      ]);

      const visitPetsByVisitId = new Map<string, NonNullable<typeof visitPets>>();
      const visitExtrasByVisitId = new Map<string, NonNullable<typeof visitExtras>>();

      for (const visitPet of visitPets ?? []) {
        const currentVisitPets = visitPetsByVisitId.get(visitPet.visit_id) ?? [];
        currentVisitPets.push(visitPet);
        visitPetsByVisitId.set(visitPet.visit_id, currentVisitPets);
      }

      for (const visitExtra of visitExtras ?? []) {
        const currentVisitExtras = visitExtrasByVisitId.get(visitExtra.visit_id) ?? [];
        currentVisitExtras.push(visitExtra);
        visitExtrasByVisitId.set(visitExtra.visit_id, currentVisitExtras);
      }

      const currentVisit = visits[0];
      const currentVisitPets = visitPetsByVisitId.get(currentVisit.id) ?? [];
      const currentVisitExtras = visitExtrasByVisitId.get(currentVisit.id) ?? [];
      const groomingAmount = toNumber(
        currentVisitExtras.find((item) => item.label === "Grooming")?.amount,
      );
      const pickupDeliveryAmount = toNumber(
        currentVisitExtras.find((item) => item.label === "Pickup / Delivery")?.amount,
      );
      const medicationAmount = toNumber(
        currentVisitExtras.find((item) => item.label === "Medication")?.amount,
      );
      const vetsFeesAmount = toNumber(
        currentVisitExtras.find((item) => item.label === "Vets Fees")?.amount,
      );
      const trainingAmount = toNumber(
        currentVisitExtras.find((item) => item.label === "Training")?.amount,
      );

      return {
        identifier: customer.customer_code ?? customer.id,
        customerName: customer.name,
        currentVisitId: currentVisit.id,
        currentVisitDates: {
          arrivalDate: toDateInput(currentVisit.arrival_date),
          departureDate: toDateInput(currentVisit.departure_date),
        },
        initialValues: {
          ...buildInitialValuesFromVisit({
            customer,
            visit: currentVisit,
            visitPets: currentVisitPets,
          }),
          extras: {
            grooming: toMoneyString(groomingAmount),
            pickupDelivery: toMoneyString(pickupDeliveryAmount),
            medication: toMoneyString(medicationAmount),
            vetsFees: toMoneyString(vetsFeesAmount),
            training: toMoneyString(trainingAmount),
            totalExtras: toMoneyString(currentVisit.total_extras_amount),
          },
        },
        visitHistory: visits.map((visit) => ({
          id: visit.id,
          status: formatStatusLabel(visit.status),
          arrivalDate: toDateInput(visit.arrival_date),
          departureDate: toDateInput(visit.departure_date),
          boarders: (visitPetsByVisitId.get(visit.id) ?? []).map((visitPet) => visitPet.pet_name),
          totalAmount: toNumber(visit.total_amount),
          amountPaid: toNumber(visit.amount_paid),
          balanceOwed: toNumber(visit.balance_owed),
          createdAt: visit.created_at ?? "",
        })),
      };
    }

    const { data: booking } = await supabase
      .from("bookings")
      .select(
        "id, arrival_date, departure_date, boarders_booked, days_inclusive, booking_notes, grooming_amount, pickup_delivery_amount, medication_amount, vets_fees_amount, training_amount, total_extras_amount, total_daily_rate, total_days, discount_amount, extras_amount, subtotal_amount, vat_percent, total_amount, amount_paid, balance_owed",
      )
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: bookingPets } = booking
      ? await supabase
          .from("booking_pets")
          .select(
            "daily_rate, medications, special_diet, comments, pet:pets(name, breed_description, age_years, vaccination_date, kennel_cough_date)",
          )
          .eq("booking_id", booking.id)
      : { data: null };

    const boarders = Array.isArray(bookingPets)
      ? bookingPets.map((entry) => {
          const pet = getRelatedPet(entry.pet);

          return {
            pet_name: pet?.name ?? "",
            breed_description: pet?.breed_description ?? "",
            age_years: pet?.age_years ?? null,
            medications: entry.medications ?? "",
            special_diet: entry.special_diet ?? "",
            comments: entry.comments ?? "",
            vaccination_date: toDateInput(pet?.vaccination_date),
            kennel_cough_date: toDateInput(pet?.kennel_cough_date),
            daily_rate: entry.daily_rate ?? 0,
          };
        })
      : [];

    return {
      identifier: customer.customer_code ?? customer.id,
      customerName: customer.name,
      currentVisitDates: {
        arrivalDate: toDateInput(booking?.arrival_date),
        departureDate: toDateInput(booking?.departure_date),
      },
      initialValues: {
        ...buildInitialValuesFromVisit({
          customer,
          visit: booking
            ? {
                arrival_date: booking.arrival_date,
                departure_date: booking.departure_date,
                boarders_booked: booking.boarders_booked,
                days_inclusive: booking.days_inclusive,
                booking_notes: booking.booking_notes,
                total_daily_rate: booking.total_daily_rate,
                total_extras_amount: booking.total_extras_amount,
                discount_amount: booking.discount_amount,
                vat_percent: booking.vat_percent,
                total_amount: booking.total_amount,
                amount_paid: booking.amount_paid,
                balance_owed: booking.balance_owed,
              }
            : null,
          visitPets: boarders,
        }),
        extras: {
          grooming: toMoneyString(booking?.grooming_amount),
          pickupDelivery: toMoneyString(booking?.pickup_delivery_amount),
          medication: toMoneyString(booking?.medication_amount),
          vetsFees: toMoneyString(booking?.vets_fees_amount),
          training: toMoneyString(booking?.training_amount),
          totalExtras: toMoneyString(booking?.total_extras_amount),
        },
      },
      visitHistory: booking
        ? [
            {
              id: booking.id,
              status: "Legacy booking",
              arrivalDate: toDateInput(booking.arrival_date),
              departureDate: toDateInput(booking.departure_date),
              boarders: boarders.map((boarder) => boarder.pet_name),
              totalAmount: toNumber(booking.total_amount),
              amountPaid: toNumber(booking.amount_paid),
              balanceOwed: toNumber(booking.balance_owed),
              createdAt: "",
            },
          ]
        : [],
    };
  } catch {
    return buildMockCustomerDetail(identifier);
  }
}

export async function getVisitDetailRecord(visitId: string): Promise<VisitDetailRecord | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: visit } = await supabase
      .from("visits")
      .select(
        "id, customer_id, status, arrival_date, departure_date, boarders_booked, days_inclusive, booking_notes, total_daily_rate, total_extras_amount, discount_amount, subtotal_amount, vat_percent, total_amount, amount_paid, balance_owed",
      )
      .eq("id", visitId)
      .maybeSingle();

    if (!visit) {
      return null;
    }

    const [{ data: customer }, { data: visitPets }, { data: visitExtras }] = await Promise.all([
      supabase
        .from("customers")
        .select("customer_code, name, address_line_1, town_city, postcode, phone, email")
        .eq("id", visit.customer_id)
        .maybeSingle(),
      supabase
        .from("visit_pets")
        .select(
          "pet_name, breed_description, age_years, vaccination_date, kennel_cough_date, daily_rate, medications, special_diet, comments",
        )
        .eq("visit_id", visitId),
      supabase
        .from("visit_extras")
        .select("label, amount")
        .eq("visit_id", visitId),
    ]);

    return {
      id: visit.id,
      customerIdentifier: customer?.customer_code ?? visit.customer_id,
      customerName: customer?.name ?? "Customer",
      customerAddressLine1: customer?.address_line_1 ?? "",
      customerTownCity: customer?.town_city ?? "",
      customerPostcode: customer?.postcode ?? "",
      customerPhone: customer?.phone ?? "",
      customerEmail: customer?.email ?? "",
      status: formatStatusLabel(visit.status),
      arrivalDate: toDateInput(visit.arrival_date),
      departureDate: toDateInput(visit.departure_date),
      boardersBooked: toNumber(visit.boarders_booked),
      daysInclusive: toNumber(visit.days_inclusive),
      bookingNotes: visit.booking_notes ?? "",
      totalDailyRate: toNumber(visit.total_daily_rate),
      totalExtrasAmount: toNumber(visit.total_extras_amount),
      discountAmount: toNumber(visit.discount_amount),
      subtotalAmount: toNumber(visit.subtotal_amount),
      vatPercent: toNumber(visit.vat_percent),
      totalAmount: toNumber(visit.total_amount),
      amountPaid: toNumber(visit.amount_paid),
      balanceOwed: toNumber(visit.balance_owed),
      boarders: (visitPets ?? []).map((visitPet) => ({
        petName: visitPet.pet_name,
        breedDescription: visitPet.breed_description ?? "",
        ageYears: visitPet.age_years ?? null,
        vaccinationDate: toDateInput(visitPet.vaccination_date),
        kennelCoughDate: toDateInput(visitPet.kennel_cough_date),
        dailyRate: toNumber(visitPet.daily_rate),
        medications: visitPet.medications ?? "",
        specialDiet: visitPet.special_diet ?? "",
        comments: visitPet.comments ?? "",
      })),
      extras: (visitExtras ?? []).map((visitExtra) => ({
        label: visitExtra.label,
        amount: toNumber(visitExtra.amount),
      })),
    };
  } catch {
    return null;
  }
}

export async function getPetListItems(): Promise<PetListItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return buildMockPetListItems();
  }

  try {
    const supabase = await getSupabaseServerClient();
    const [{ data: pets, error: petsError }, { data: customers }, { data: visitPets }, { data: visits }] = await Promise.all([
      supabase
        .from("pets")
        .select("id, customer_id, name, breed_description, age_years, default_daily_rate, medications, special_diet, comments, vaccination_date, kennel_cough_date")
        .order("created_at", { ascending: false }),
      supabase
        .from("customers")
        .select("id, customer_code, name, status"),
      supabase
        .from("visit_pets")
        .select("visit_id, pet_id, pet_name, daily_rate, medications, special_diet, comments"),
      supabase
        .from("visits")
        .select("id, customer_id, arrival_date, departure_date, status")
        .order("arrival_date", { ascending: true }),
    ]);

    if (petsError || !pets) {
      return buildMockPetListItems();
    }

    const customersById = new Map((customers ?? []).map((customer) => [customer.id, customer]));
    const visitById = new Map((visits ?? []).map((visit) => [visit.id, visit]));
    const upcomingVisitByPetId = new Map<string, NonNullable<typeof visitPets>[number]>();
    const today = new Date();

    for (const visitPet of visitPets ?? []) {
      if (!visitPet.pet_id) {
        continue;
      }

      const visit = visitById.get(visitPet.visit_id);

      if (!visit?.departure_date || new Date(`${visit.departure_date}T00:00:00`) < today) {
        continue;
      }

      const current = upcomingVisitByPetId.get(visitPet.pet_id);

      if (!current) {
        upcomingVisitByPetId.set(visitPet.pet_id, visitPet);
        continue;
      }

      const currentVisit = visitById.get(current.visit_id);

      if (
        currentVisit?.arrival_date &&
        visit.arrival_date &&
        new Date(`${visit.arrival_date}T00:00:00`) < new Date(`${currentVisit.arrival_date}T00:00:00`)
      ) {
        upcomingVisitByPetId.set(visitPet.pet_id, visitPet);
      }
    }

    return pets.map((pet) => {
      const owner = customersById.get(pet.customer_id);
      const upcomingVisitPet = upcomingVisitByPetId.get(pet.id);
      const upcomingVisit = upcomingVisitPet ? visitById.get(upcomingVisitPet.visit_id) : null;

      return {
        id: pet.id,
        name: pet.name,
        breedDescription: pet.breed_description ?? "Breed not recorded",
        ownerName: owner?.name ?? "Customer",
        ownerIdentifier: owner?.customer_code ?? pet.customer_id,
        ageYears: pet.age_years,
        medications: upcomingVisitPet?.medications ?? pet.medications ?? "None recorded",
        specialDiet: upcomingVisitPet?.special_diet ?? pet.special_diet ?? "Standard kennel food",
        dailyRate: toNumber(upcomingVisitPet?.daily_rate ?? pet.default_daily_rate),
        upcomingStay: formatDateRange(upcomingVisit?.arrival_date, upcomingVisit?.departure_date),
        status: owner?.status ?? "Active",
      };
    });
  } catch {
    return buildMockPetListItems();
  }
}

export async function getPetDetailRecord(identifier: string): Promise<PetDetailRecord | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return buildMockPetDetailRecord(identifier);
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select(
        "id, customer_id, name, breed_description, age_years, default_daily_rate, medications, special_diet, comments, vaccination_date, kennel_cough_date",
      )
      .eq("id", identifier)
      .maybeSingle();

    if (petError || !pet) {
      return buildMockPetDetailRecord(identifier);
    }

    const [{ data: customer }, { data: visitPets }, { data: visits }] = await Promise.all([
      supabase
        .from("customers")
        .select("customer_code, name, phone, email, town_city")
        .eq("id", pet.customer_id)
        .maybeSingle(),
      supabase
        .from("visit_pets")
        .select("visit_id, pet_id, pet_name, daily_rate, medications, special_diet, comments")
        .eq("pet_id", pet.id),
      supabase
        .from("visits")
        .select("id, arrival_date, departure_date, status")
        .order("arrival_date", { ascending: false }),
    ]);

    const visitsById = new Map((visits ?? []).map((visit) => [visit.id, visit]));
    const stayHistory = (visitPets ?? [])
      .map((visitPet) => {
        const visit = visitsById.get(visitPet.visit_id);

        if (!visit) {
          return null;
        }

        return {
          visitId: visit.id,
          arrivalDate: toDateInput(visit.arrival_date),
          departureDate: toDateInput(visit.departure_date),
          status: formatStatusLabel(visit.status),
          dailyRate: toNumber(visitPet.daily_rate),
          medications: visitPet.medications ?? pet.medications ?? "None recorded",
          specialDiet: visitPet.special_diet ?? pet.special_diet ?? "Standard kennel food",
          comments: visitPet.comments ?? pet.comments ?? "",
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((left, right) => right.arrivalDate.localeCompare(left.arrivalDate));

    const upcomingStay = stayHistory.find((visit) => {
      if (!visit.departureDate) {
        return false;
      }

      return new Date(`${visit.departureDate}T00:00:00`) >= new Date();
    });

    return {
      id: pet.id,
      name: pet.name,
      breedDescription: pet.breed_description ?? "Breed not recorded",
      ownerName: customer?.name ?? "Customer",
      ownerIdentifier: customer?.customer_code ?? pet.customer_id,
      ownerPhone: customer?.phone ?? "No phone recorded",
      ownerEmail: customer?.email ?? "No email recorded",
      ownerTownCity: customer?.town_city ?? "No town recorded",
      ageYears: pet.age_years,
      vaccinationDate: toDisplayDate(toDateInput(pet.vaccination_date)),
      kennelCoughDate: toDisplayDate(toDateInput(pet.kennel_cough_date)),
      medications: pet.medications ?? "None recorded",
      specialDiet: pet.special_diet ?? "Standard kennel food",
      comments: pet.comments ?? "No notes recorded.",
      dailyRate: toNumber(pet.default_daily_rate),
      upcomingStay: upcomingStay
        ? formatDateRange(upcomingStay.arrivalDate, upcomingStay.departureDate)
        : "No booking scheduled",
      stayHistory,
    };
  } catch {
    return buildMockPetDetailRecord(identifier);
  }
}