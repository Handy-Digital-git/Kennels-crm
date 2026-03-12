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

    let customerResponse = await supabase
      .from("customers")
      .select(
        "id, customer_code, name, email, phone, address_line_1, town_city, postcode, emergency_contact_name, emergency_contact_phone, status",
      )
      .eq("customer_code", identifier)
      .maybeSingle();

    if (!customerResponse.data && /^[0-9a-f-]{36}$/i.test(identifier)) {
      customerResponse = await supabase
        .from("customers")
        .select(
          "id, customer_code, name, email, phone, address_line_1, town_city, postcode, emergency_contact_name, emergency_contact_phone, status",
        )
        .eq("id", identifier)
        .maybeSingle();
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
          "pet_name, breed_description, daily_rate, medications, special_diet, comments",
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