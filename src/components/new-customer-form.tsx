"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  CalendarDays,
  CircleDollarSign,
  Dog,
  LoaderCircle,
  UserRound,
} from "lucide-react";
import {
  createCustomerBooking,
  updateCustomerBooking,
} from "@/app/customers/actions";
import {
  boarderTitles,
  emptyCustomerFormValues,
  type CustomerFormValues,
} from "@/lib/customer-form-schema";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});


function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
      {error ? <span className="mt-2 block text-sm text-rose-600">{error}</span> : null}
    </label>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";

const computedInputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 outline-none";

const currencyInputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";

const computedCurrencyInputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-100 py-3 pr-4 pl-10 text-sm font-medium text-slate-700 outline-none";

function CurrencyInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  const { className, ...rest } = props;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-400">
        £
      </span>
      <input className={className} {...rest} />
    </div>
  );
}

function parseAmount(value: string | undefined) {
  const parsed = Number.parseFloat(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoneyString(value: string | undefined) {
  return parseAmount(value).toFixed(2);
}

function hasBoarderDetails(
  boarder: CustomerFormValues["boarders"][number] | undefined,
) {
  if (!boarder) {
    return false;
  }

  return Boolean(
    boarder.name.trim() ||
      boarder.description.trim() ||
      boarder.age.trim() ||
      boarder.medications.trim() ||
      boarder.specialDiet.trim() ||
      boarder.comments.trim() ||
      boarder.vaccinationDate.trim() ||
      boarder.kennelCoughDate.trim() ||
      boarder.dailyRate.trim(),
  );
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

function clampBoarderCount(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(Math.max(parsed, 1), boarderTitles.length);
}

type NewCustomerFormProps = {
  mode?: "create" | "edit";
  customerIdentifier?: string;
  initialValues?: CustomerFormValues;
  currentVisitId?: string;
  currentVisitDates?: {
    arrivalDate: string;
    departureDate: string;
  };
};

export function NewCustomerForm({
  mode = "create",
  customerIdentifier,
  initialValues = emptyCustomerFormValues,
  currentVisitId,
  currentVisitDates,
}: NewCustomerFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    defaultValues: initialValues,
  });

  const arrivalDate = watch("booking.arrivalDate");
  const departureDate = watch("booking.departureDate");
  const boardersBookedValue = watch("booking.boardersBooked");
  const boarders = watch("boarders");
  const extras = watch("extras");
  const discount = watch("billing.discount");
  const vatPercent = watch("billing.vatPercent");
  const amountPaid = watch("billing.amountPaid");
  const autoClearedPaidAmountRef = useRef(false);
  const originalAmountPaid = formatMoneyString(initialValues.billing.amountPaid);

  const visibleBoarderCount = clampBoarderCount(boardersBookedValue);
  const visibleBoarders = (boarders ?? []).slice(0, visibleBoarderCount);
  const activeBoarders = visibleBoarders.filter(hasBoarderDetails);
  const daysInclusive = getInclusiveDays(arrivalDate, departureDate);
  const totalDailyRate = activeBoarders.reduce(
    (sum, boarder) => sum + parseAmount(boarder.dailyRate),
    0,
  );
  const boarderSubtotals = visibleBoarders.map((boarder) => {
    if (!hasBoarderDetails(boarder)) {
      return 0;
    }

    return parseAmount(boarder.dailyRate) * daysInclusive;
  });
  const totalExtras = [
    extras?.grooming,
    extras?.pickupDelivery,
    extras?.medication,
    extras?.vetsFees,
    extras?.training,
  ].reduce((sum, value) => sum + parseAmount(value), 0);
  const discountAmount = parseAmount(discount);
  const vatRate = parseAmount(vatPercent);
  const paidAmount = parseAmount(amountPaid);
  const subtotal = Math.max(0, totalDailyRate * daysInclusive + totalExtras - discountAmount);
  const total = subtotal + subtotal * (vatRate / 100);
  const balanceOwed = Math.max(0, total - paidAmount);

  useEffect(() => {
    const nextBoardersBooked = String(visibleBoarderCount);
    const nextDaysInclusive = String(daysInclusive);
    const nextTotalDailyRate = totalDailyRate.toFixed(2);
    const nextTotalExtras = totalExtras.toFixed(2);
    const nextSubtotal = subtotal.toFixed(2);
    const nextTotal = total.toFixed(2);
    const nextBalanceOwed = balanceOwed.toFixed(2);

    if (getValues("booking.boardersBooked") !== nextBoardersBooked) {
      setValue("booking.boardersBooked", nextBoardersBooked);
    }

    boarders?.slice(visibleBoarderCount).forEach((boarder, index) => {
      if (!hasBoarderDetails(boarder)) {
        return;
      }

      setValue(
        `boarders.${visibleBoarderCount + index}`,
        { ...emptyCustomerFormValues.boarders[0] },
      );
    });

    if (getValues("booking.daysInclusive") !== nextDaysInclusive) {
      setValue("booking.daysInclusive", nextDaysInclusive);
    }

    if (getValues("extras.totalExtras") !== nextTotalExtras) {
      setValue("extras.totalExtras", nextTotalExtras);
    }

    if (getValues("billing.totalDailyRate") !== nextTotalDailyRate) {
      setValue("billing.totalDailyRate", nextTotalDailyRate);
    }

    if (getValues("billing.totalDays") !== nextDaysInclusive) {
      setValue("billing.totalDays", nextDaysInclusive);
    }

    if (getValues("billing.extras") !== nextTotalExtras) {
      setValue("billing.extras", nextTotalExtras);
    }

    if (getValues("billing.subtotal") !== nextSubtotal) {
      setValue("billing.subtotal", nextSubtotal);
    }

    if (getValues("billing.total") !== nextTotal) {
      setValue("billing.total", nextTotal);
    }

    if (getValues("billing.balanceOwed") !== nextBalanceOwed) {
      setValue("billing.balanceOwed", nextBalanceOwed);
    }
  }, [
    balanceOwed,
    boarders,
    daysInclusive,
    getValues,
    setValue,
    subtotal,
    total,
    totalDailyRate,
    totalExtras,
    visibleBoarderCount,
  ]);

  useEffect(() => {
    if (mode !== "edit" || !currentVisitId || !currentVisitDates) {
      return;
    }

    const isNewVisitDraft =
      arrivalDate !== currentVisitDates.arrivalDate ||
      departureDate !== currentVisitDates.departureDate;
    const currentAmountPaid = formatMoneyString(getValues("billing.amountPaid"));

    if (isNewVisitDraft) {
      if (!autoClearedPaidAmountRef.current && currentAmountPaid === originalAmountPaid) {
        setValue("billing.amountPaid", "0.00");
        autoClearedPaidAmountRef.current = true;
      }

      return;
    }

    if (autoClearedPaidAmountRef.current && currentAmountPaid === "0.00") {
      setValue("billing.amountPaid", originalAmountPaid);
    }

    autoClearedPaidAmountRef.current = false;
  }, [
    arrivalDate,
    currentVisitDates,
    currentVisitId,
    departureDate,
    getValues,
    mode,
    originalAmountPaid,
    setValue,
  ]);

  const onSubmit = handleSubmit((values) => {
    setServerError(null);

    startTransition(async () => {
      const result =
        mode === "edit" && customerIdentifier
          ? await updateCustomerBooking(customerIdentifier, values, {
              currentVisitId,
              originalArrivalDate: currentVisitDates?.arrivalDate,
              originalDepartureDate: currentVisitDates?.departureDate,
              originalAmountPaid,
            })
          : await createCustomerBooking(values);

      if (result && "error" in result && result.error) {
        setServerError(result.error);
        return;
      }

      const nextCustomerIdentifier =
        result && "customerCode" in result && result.customerCode
          ? result.customerCode
          : customerIdentifier;

      if (nextCustomerIdentifier) {
        router.push(`/customers/${nextCustomerIdentifier}`);
      } else {
        router.push("/customers");
      }

      router.refresh();
    });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-950 p-3 text-white">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-950">Customer details</h3>
            <p className="text-sm text-slate-500">
              Primary owner contact information and account setup.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Customer name" error={errors.customer?.name?.message}>
            <input
              {...register("customer.name", { required: "Customer name is required." })}
              className={inputClassName}
              placeholder="Enter full name"
            />
          </Field>
          <Field label="Email address">
            <input
              {...register("customer.email")}
              type="email"
              className={inputClassName}
              placeholder="name@example.com"
            />
          </Field>
          <Field label="Phone number">
            <input
              {...register("customer.phone")}
              type="tel"
              className={inputClassName}
              placeholder="07xxx xxxxxx"
            />
          </Field>
          <Field label="Address line 1">
            <input {...register("customer.addressLine1")} className={inputClassName} />
          </Field>
          <Field label="Town / City">
            <input {...register("customer.townCity")} className={inputClassName} />
          </Field>
          <Field label="Postcode">
            <input {...register("customer.postcode")} className={inputClassName} />
          </Field>
          <Field label="Emergency contact name">
            <input
              {...register("customer.emergencyContactName")}
              className={inputClassName}
            />
          </Field>
          <Field label="Emergency contact phone">
            <input
              {...register("customer.emergencyContactPhone")}
              type="tel"
              className={inputClassName}
            />
          </Field>
          <Field label="Account status">
            <select {...register("customer.status")} className={inputClassName}>
              <option value="Active">Active</option>
              <option value="New">New</option>
              <option value="Returning">Returning</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-950">Booking overview</h3>
            <p className="text-sm text-slate-500">
              Stay dates, number of boarders, and general booking notes.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Arrival date" error={errors.booking?.arrivalDate?.message}>
            <input
              {...register("booking.arrivalDate", {
                required: "Arrival date is required.",
              })}
              type="date"
              className={inputClassName}
            />
          </Field>
          <Field label="Departure date" error={errors.booking?.departureDate?.message}>
            <input
              {...register("booking.departureDate", {
                required: "Departure date is required.",
              })}
              type="date"
              className={inputClassName}
            />
          </Field>
          <Field label="Boarders booked">
            <input
              {...register("booking.boardersBooked")}
              type="number"
              min="1"
              max={boarderTitles.length}
              className={inputClassName}
            />
          </Field>
          <Field label="Days inclusive">
            <input
              {...register("booking.daysInclusive")}
              type="number"
              min="0"
              className={computedInputClassName}
              readOnly
            />
          </Field>
        </div>

        <Field label="Booking notes">
          <textarea
            {...register("booking.bookingNotes")}
            rows={4}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </Field>
      </section>

      <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white">
            <Dog className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-950">Boarder details</h3>
            <p className="text-sm text-slate-500">
              Capture the animal profile, feeding, medication, and vaccination details for each boarder.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {boarderTitles.slice(0, visibleBoarderCount).map((title, index) => (
            <div
              key={title}
              className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
            >
              <h4 className="text-base font-semibold text-slate-950">{title}</h4>
              <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <Field
                  label="Boarder name"
                  error={errors.boarders?.[index]?.name?.message}
                >
                  <input
                    {...register(`boarders.${index}.name` as const, {
                      validate: (value, values) => {
                        const row = values.boarders?.[index];
                        const hasOtherValue = Boolean(
                          row?.description ||
                            row?.age ||
                            row?.medications ||
                            row?.specialDiet ||
                            row?.comments ||
                            row?.vaccinationDate ||
                            row?.kennelCoughDate ||
                            row?.dailyRate,
                        );

                        if (hasOtherValue && !value.trim()) {
                          return "Boarder name is required when details are entered.";
                        }

                        return true;
                      },
                    })}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Description / breed">
                  <input
                    {...register(`boarders.${index}.description` as const)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Age">
                  <input
                    {...register(`boarders.${index}.age` as const)}
                    type="number"
                    min="0"
                    className={inputClassName}
                  />
                </Field>
                <Field label="Medications">
                  <input
                    {...register(`boarders.${index}.medications` as const)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Special diet">
                  <input
                    {...register(`boarders.${index}.specialDiet` as const)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Daily rate">
                  <CurrencyInput
                    {...register(`boarders.${index}.dailyRate` as const)}
                    type="number"
                    step="0.01"
                    min="0"
                    className={currencyInputClassName}
                  />
                </Field>
                <Field label="Boarder subtotal">
                  <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
                    {currencyFormatter.format(boarderSubtotals[index] ?? 0)}
                  </div>
                  <span className="mt-2 block text-xs text-slate-500">
                    Daily rate x {daysInclusive} day{daysInclusive === 1 ? "" : "s"}
                  </span>
                </Field>
                <Field label="Vaccination date">
                  <input
                    {...register(`boarders.${index}.vaccinationDate` as const)}
                    type="date"
                    className={inputClassName}
                  />
                </Field>
                <Field label="Kennel cough date">
                  <input
                    {...register(`boarders.${index}.kennelCoughDate` as const)}
                    type="date"
                    className={inputClassName}
                  />
                </Field>
                <Field label="Comments">
                  <textarea
                    {...register(`boarders.${index}.comments` as const)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500 p-3 text-white">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-950">Extras and services</h3>
              <p className="text-sm text-slate-500">
                Additional service charges listed on the booking sheet.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Grooming">
              <CurrencyInput {...register("extras.grooming")} type="number" step="0.01" min="0" className={currencyInputClassName} />
            </Field>
            <Field label="Pickup / Delivery">
              <CurrencyInput {...register("extras.pickupDelivery")} type="number" step="0.01" min="0" className={currencyInputClassName} />
            </Field>
            <Field label="Medication">
              <CurrencyInput {...register("extras.medication")} type="number" step="0.01" min="0" className={currencyInputClassName} />
            </Field>
            <Field label="Vets Fees">
              <CurrencyInput {...register("extras.vetsFees")} type="number" step="0.01" min="0" className={currencyInputClassName} />
            </Field>
            <Field label="Training">
              <CurrencyInput {...register("extras.training")} type="number" step="0.01" min="0" className={currencyInputClassName} />
            </Field>
            <Field label="Total Extras">
              <CurrencyInput {...register("extras.totalExtras")} type="number" step="0.01" min="0" className={computedCurrencyInputClassName} readOnly />
            </Field>
          </div>
        </section>

        <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-950">Billing summary</h3>
          <p className="mt-1 text-sm text-slate-500">
            Totals taken directly from the paper booking sheet.
          </p>

          <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Final price
            </p>
            <p className="mt-3 text-4xl font-bold tracking-tight">
              {currencyFormatter.format(total)}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Balance owed: {currencyFormatter.format(balanceOwed)}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <Field label="Total Daily Rate">
              <CurrencyInput {...register("billing.totalDailyRate")} type="number" step="0.01" min="0" className={computedCurrencyInputClassName} readOnly />
            </Field>
            <Field label="Total Days">
              <input {...register("billing.totalDays")} type="number" min="0" className={computedInputClassName} readOnly />
            </Field>
            <Field label="Discount">
              <CurrencyInput {...register("billing.discount")} type="number" step="0.01" min="0" className={currencyInputClassName} />
            </Field>
            <Field label="Extras">
              <CurrencyInput {...register("billing.extras")} type="number" step="0.01" min="0" className={computedCurrencyInputClassName} readOnly />
            </Field>
            <Field label="Sub Total">
              <CurrencyInput {...register("billing.subtotal")} type="number" step="0.01" min="0" className={computedCurrencyInputClassName} readOnly />
            </Field>
            <Field label="VAT %">
              <input {...register("billing.vatPercent")} type="number" step="0.01" min="0" className={inputClassName} />
            </Field>
            <Field label="Total">
              <CurrencyInput {...register("billing.total")} type="number" step="0.01" min="0" className={computedCurrencyInputClassName} readOnly />
            </Field>
            <Field label="Less Paid">
              <CurrencyInput {...register("billing.amountPaid")} type="number" step="0.01" min="0" className={currencyInputClassName} />
            </Field>
            <Field label="Balance Owed">
              <CurrencyInput {...register("billing.balanceOwed")} type="number" step="0.01" min="0" className={computedCurrencyInputClassName} readOnly />
            </Field>
          </div>
        </section>
      </div>

      <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-950">Terms and care reminders</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          All dogs must be fully vaccinated against distemper, hepatitis, leptospirosis, canine parvovirus, and relevant kennel cough cover before boarding is confirmed.
        </p>
      </section>

      {serverError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {serverError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/customers"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          <span>{isPending ? "Saving..." : mode === "edit" ? "Save changes" : "Save customer"}</span>
        </button>
      </div>
    </form>
  );
}