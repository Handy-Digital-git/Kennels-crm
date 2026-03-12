import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { NewCustomerForm } from "@/components/new-customer-form";
import { VisitActionsMenu } from "@/components/visit-actions-menu";
import { getCustomerDetailRecord } from "@/lib/customer-form-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatVisitDateRange(arrivalDate: string, departureDate: string) {
  if (!arrivalDate || !departureDate) {
    return "Dates not set";
  }

  const arrival = new Date(`${arrivalDate}T00:00:00`);
  const departure = new Date(`${departureDate}T00:00:00`);

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

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customer = await getCustomerDetailRecord(id);

  if (!customer) {
    notFound();
  }

  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/customers"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to customers</span>
            </Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Customer profile
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
              {customer.customerName}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              View and amend the full customer, booking, boarder, and billing record from one editable page.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
            Record: <span className="font-semibold text-slate-900">{customer.identifier}</span>
          </div>
        </div>

        <NewCustomerForm
          mode="edit"
          customerIdentifier={customer.identifier}
          initialValues={customer.initialValues}
          currentVisitId={customer.currentVisitId}
          currentVisitDates={customer.currentVisitDates}
        />

        <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Visit history
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Previous stays and balances
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Every date change creates a separate visit record so billing and care notes stay attached to the correct stay.
              </p>
            </div>

            <Link
              href="/visits"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
            >
              <span>Open visits register</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {customer.visitHistory.map((visit) => (
              <div
                key={visit.id}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-lg font-semibold text-slate-950">
                      {formatVisitDateRange(visit.arrivalDate, visit.departureDate)}
                    </h4>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                      {visit.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {visit.boarders.length > 0
                      ? visit.boarders.join(", ")
                      : "No boarders recorded"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:min-w-105">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Total
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formatCurrency(visit.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Paid
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formatCurrency(visit.amountPaid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Balance
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formatCurrency(visit.balanceOwed)}
                    </p>
                  </div>
                </div>

                <div className="lg:ml-6 lg:self-start">
                  <VisitActionsMenu visitId={visit.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}