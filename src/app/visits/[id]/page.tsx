import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PaginationControls } from "@/components/pagination-controls";
import { VisitPaymentForm } from "@/components/visit-payment-form";
import { getVisitDetailRecord } from "@/lib/customer-form-data";
import { getCurrentPage, paginateItems } from "@/lib/pagination";

type VisitDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    page?: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDateRange(arrivalDate: string, departureDate: string) {
  if (!arrivalDate || !departureDate) {
    return "Dates not set";
  }

  return `${new Date(`${arrivalDate}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} - ${new Date(`${departureDate}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

export default async function VisitDetailPage({ params, searchParams }: VisitDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const requestedPage = getCurrentPage(resolvedSearchParams?.page);
  const visit = await getVisitDetailRecord(id);

  if (!visit) {
    notFound();
  }

  const paginatedExtras = paginateItems(visit.extras, requestedPage);

  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <Link
            href={`/customers/${visit.customerIdentifier}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to customer</span>
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Visit record
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            {visit.customerName}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {formatDateRange(visit.arrivalDate, visit.departureDate)}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Status
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{visit.status}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Boarders
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{visit.boardersBooked}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Total
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{formatCurrency(visit.totalAmount)}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Balance
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{formatCurrency(visit.balanceOwed)}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-slate-950">Boarders</h2>
              {visit.boarders.map((boarder) => (
                <div key={boarder.petName} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-950">{boarder.petName}</p>
                      <p className="text-sm text-slate-500">{boarder.breedDescription || "Breed not recorded"}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-950">{formatCurrency(boarder.dailyRate)} / day</p>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-800">Medication:</span> {boarder.medications || "None"}</p>
                    <p><span className="font-semibold text-slate-800">Diet:</span> {boarder.specialDiet || "Standard"}</p>
                    <p><span className="font-semibold text-slate-800">Comments:</span> {boarder.comments || "None"}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-slate-950">Extras</h2>
              {visit.extras.length > 0 ? (
                <div className="rounded-3xl border border-slate-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-5 py-4">Extra</th>
                        <th className="px-5 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {paginatedExtras.pageItems.map((extra) => (
                        <tr key={extra.label}>
                          <td className="px-5 py-4 text-slate-700">{extra.label}</td>
                          <td className="px-5 py-4 text-right font-semibold text-slate-950">{formatCurrency(extra.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls
                  pathname={`/visits/${visit.id}`}
                  currentPage={paginatedExtras.currentPage}
                  totalPages={paginatedExtras.totalPages}
                  totalItems={paginatedExtras.totalItems}
                  startItem={paginatedExtras.startItem}
                  endItem={paginatedExtras.endItem}
                  searchParams={resolvedSearchParams}
                />
              ) : (
                <p className="text-sm text-slate-500">No extras recorded for this visit.</p>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Billing summary</h2>
              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Total daily rate</span>
                  <span className="font-semibold text-slate-950">{formatCurrency(visit.totalDailyRate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total extras</span>
                  <span className="font-semibold text-slate-950">{formatCurrency(visit.totalExtrasAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span className="font-semibold text-slate-950">{formatCurrency(visit.discountAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sub total</span>
                  <span className="font-semibold text-slate-950">{formatCurrency(visit.subtotalAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>VAT</span>
                  <span className="font-semibold text-slate-950">{visit.vatPercent.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="font-semibold text-slate-800">Total</span>
                  <span className="text-lg font-bold text-slate-950">{formatCurrency(visit.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Paid</span>
                  <span className="font-semibold text-slate-950">{formatCurrency(visit.amountPaid)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Balance owed</span>
                  <span className="font-semibold text-rose-600">{formatCurrency(visit.balanceOwed)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Settle bill</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Record payment against this visit only. Previous and future visits remain untouched.
              </p>

              <div className="mt-6">
                <VisitPaymentForm
                  visitId={visit.id}
                  initialAmountPaid={visit.amountPaid}
                  totalAmount={visit.totalAmount}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}