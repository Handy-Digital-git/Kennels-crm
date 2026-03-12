import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PrintPageButton } from "@/components/print-page-button";
import { getVisitDetailRecord } from "@/lib/customer-form-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type VisitPrintPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VisitPrintPage({ params }: VisitPrintPageProps) {
  const { id } = await params;
  const visit = await getVisitDetailRecord(id);

  if (!visit) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-5xl space-y-6 print:max-w-none print:space-y-0">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <Link
            href="/visits"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to visits</span>
          </Link>
          <PrintPageButton />
        </div>

        <article className="print-single-page rounded-4xl border border-black/15 bg-white p-8 text-black shadow-sm print:rounded-none print:border-0 print:p-3 print:text-[9.75px] print:leading-[1.12] print:shadow-none">
          <div className="rounded-3xl border border-black/20 bg-slate-50 px-6 py-8 text-center print:rounded-2xl print:border-black/20 print:bg-transparent print:px-3.5 print:py-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black print:text-[10px]">
              Blairadam Boarding Kennels & Cattery
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-black print:mt-1 print:text-[19px]">
              {visit.customerName}
            </h1>
            <p className="mt-3 text-sm leading-6 text-black print:mt-1 print:text-[9.75px] print:leading-4">
              {visit.customerAddressLine1 || "Address not recorded"}
              <br />
              {visit.customerTownCity || "Town not recorded"}
              {visit.customerPostcode ? `, ${visit.customerPostcode}` : ""}
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] print:mt-2.5 print:grid-cols-2 print:gap-2">
            <section className="rounded-3xl border border-black/15 p-6 print:rounded-2xl print:p-2.5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black print:text-[10px]">
                Stay summary
              </p>
              <dl className="mt-4 space-y-3 text-sm text-black print:mt-1.5 print:space-y-1 print:text-[9.75px]">
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Arrival</dt>
                  <dd>{formatDate(visit.arrivalDate)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Departure</dt>
                  <dd>{formatDate(visit.departureDate)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Boarders booked</dt>
                  <dd>{visit.boardersBooked}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Days inclusive</dt>
                  <dd>{visit.daysInclusive}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Visit record</dt>
                  <dd>{visit.id}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-black/15 p-6 print:rounded-2xl print:p-2.5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black print:text-[10px]">
                Customer contact
              </p>
              <dl className="mt-4 space-y-3 text-sm text-black print:mt-1.5 print:space-y-1 print:text-[9.75px]">
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Name</dt>
                  <dd>{visit.customerName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Phone</dt>
                  <dd>{visit.customerPhone || "Not recorded"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Email</dt>
                  <dd>{visit.customerEmail || "Not recorded"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Status</dt>
                  <dd>{visit.status}</dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="mt-8 rounded-3xl border border-black/15 p-6 print:mt-2.5 print:rounded-2xl print:p-2.5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black print:text-[10px]">
              Boarders
            </p>
            <div className="mt-3 space-y-2 print:mt-1.5 print:space-y-1.5">
              {visit.boarders.map((boarder) => (
                <div
                  key={boarder.petName}
                  className="grid gap-2 rounded-2xl border border-black/10 p-3 print:grid-cols-[1.2fr_1fr_auto] print:rounded-xl print:p-2"
                >
                  <div>
                    <p className="font-semibold text-black">{boarder.petName}</p>
                    <p className="text-sm text-black/80 print:text-[9px]">
                      {boarder.breedDescription || "Breed not recorded"}
                    </p>
                  </div>
                  <div className="text-sm text-black/80 print:text-[9px]">
                    <p>Medication: {boarder.medications || "None"}</p>
                    <p>Diet: {boarder.specialDiet || "None"}</p>
                    <p>Notes: {boarder.comments || "None"}</p>
                  </div>
                  <div className="text-right font-semibold text-black">
                    {formatCurrency(boarder.dailyRate)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] print:mt-2.5 print:grid-cols-[1.1fr_0.9fr] print:gap-2">
            <section className="rounded-3xl border border-black/15 p-6 print:rounded-2xl print:p-2.5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black print:text-[10px]">
                Extras and notes
              </p>
              <div className="mt-4 space-y-2 text-sm text-black print:mt-1.5 print:space-y-1 print:text-[9.75px]">
                {visit.extras.length > 0 ? (
                  visit.extras.map((extra) => (
                    <div key={extra.label} className="flex justify-between gap-4">
                      <span>{extra.label}</span>
                      <span className="font-medium text-black">{formatCurrency(extra.amount)}</span>
                    </div>
                  ))
                ) : (
                  <p>No extras recorded.</p>
                )}
              </div>
              <div className="mt-4 rounded-2xl border border-black/10 bg-slate-50 p-4 text-sm leading-6 text-black print:mt-1.5 print:p-2 print:text-[9px] print:leading-3.25">
                {visit.bookingNotes || "No booking notes recorded."}
              </div>
            </section>

            <section className="rounded-3xl border border-black/15 p-6 print:rounded-2xl print:p-2.5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black print:text-[10px]">
                Billing summary
              </p>
              <dl className="mt-4 space-y-3 text-sm text-black print:mt-1.5 print:space-y-1 print:text-[9.75px]">
                <div className="flex justify-between gap-4">
                  <dt>Total daily rate</dt>
                  <dd className="font-medium text-black">{formatCurrency(visit.totalDailyRate)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Total extras</dt>
                  <dd className="font-medium text-black">{formatCurrency(visit.totalExtrasAmount)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Discount</dt>
                  <dd className="font-medium text-black">{formatCurrency(visit.discountAmount)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Sub total</dt>
                  <dd className="font-medium text-black">{formatCurrency(visit.subtotalAmount)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>VAT</dt>
                  <dd className="font-medium text-black">{visit.vatPercent.toFixed(2)}%</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-black/15 pt-3 text-base font-semibold text-black print:pt-1.5 print:text-[10.25px]">
                  <dt>Total</dt>
                  <dd>{formatCurrency(visit.totalAmount)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Less paid</dt>
                  <dd className="font-medium text-black">{formatCurrency(visit.amountPaid)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-base font-semibold text-black print:text-[10.25px]">
                  <dt>Balance owed</dt>
                  <dd>{formatCurrency(visit.balanceOwed)}</dd>
                </div>
              </dl>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}