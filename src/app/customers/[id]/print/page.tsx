import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PrintPageButton } from "@/components/print-page-button";
import { getCustomerDetailRecord } from "@/lib/customer-form-data";

function formatCurrency(value: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
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

const billTerms = [
  "All dogs must be fully vaccinated against distemper, hepatitis, leptospirosis, canine parvovirus, kennel cough, and other relevant diseases three weeks prior to boarding or in accordance with manufacturer instructions.",
  "All cats must be fully vaccinated against feline influenza, feline enteritis, and other relevant diseases. We also recommend F.G.L.V. vaccine 10 days prior to boarding. A current vaccination certificate must be produced.",
  "Whilst every possible care and attention is given to each individual animal boarded at these kennels, we cannot be held responsible for loss either by illness or other cause.",
  "If a veterinary surgeon is called in for treatment, the account is to be paid by the owner.",
  "Animals are only accepted during business hours of 10am to 6pm.",
  "Animals will not be released until the boarding fees have been paid.",
];

type CustomerPrintBillPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerPrintBillPage({ params }: CustomerPrintBillPageProps) {
  const { id } = await params;
  const customer = await getCustomerDetailRecord(id);

  if (!customer) {
    notFound();
  }

  const boarders = customer.initialValues.boarders.filter((boarder) => boarder.name.trim());
  const extras = [
    { label: "Grooming", amount: customer.initialValues.extras.grooming },
    { label: "Pickup / Delivery", amount: customer.initialValues.extras.pickupDelivery },
    { label: "Medication", amount: customer.initialValues.extras.medication },
    { label: "Vets Fees", amount: customer.initialValues.extras.vetsFees },
    { label: "Training", amount: customer.initialValues.extras.training },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-5xl space-y-6 print:max-w-none print:space-y-0">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <Link
            href="/customers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to customers</span>
          </Link>
          <PrintPageButton />
        </div>

        <article className="print-single-page rounded-4xl border border-black/15 bg-white p-8 text-black shadow-sm print:rounded-none print:border-0 print:p-3 print:text-[9.75px] print:leading-[1.12] print:shadow-none">
          <div className="rounded-3xl border border-black/20 bg-slate-50 px-6 py-8 text-center print:rounded-2xl print:border-black/20 print:bg-transparent print:px-3.5 print:py-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black print:text-[10px]">
              Blairadam Boarding Kennels & Cattery
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-black print:mt-1 print:text-[19px]">
              {customer.customerName}
            </h1>
            <p className="mt-3 text-sm leading-6 text-black print:mt-1 print:text-[9.75px] print:leading-4">
              {customer.initialValues.customer.addressLine1 || "Address not recorded"}
              <br />
              {customer.initialValues.customer.townCity || "Town not recorded"}
              {customer.initialValues.customer.postcode
                ? `, ${customer.initialValues.customer.postcode}`
                : ""}
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] print:mt-2.5 print:grid-cols-1 print:gap-2">
            <section className="rounded-3xl border border-black/15 p-6 print:hidden">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black print:text-[10px]">
                Bill to
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-black print:mt-1 print:text-lg">
                {customer.customerName}
              </h2>
              <div className="mt-4 space-y-2 text-sm text-black print:mt-2 print:space-y-1 print:text-[11px] print:leading-4">
                <p>{customer.initialValues.customer.addressLine1 || "Address not recorded"}</p>
                <p>
                  {customer.initialValues.customer.townCity || "Town not recorded"}
                  {customer.initialValues.customer.postcode
                    ? `, ${customer.initialValues.customer.postcode}`
                    : ""}
                </p>
                <p>{customer.initialValues.customer.phone || "No phone recorded"}</p>
                <p>{customer.initialValues.customer.email || "No email recorded"}</p>
              </div>
            </section>

            <section className="rounded-3xl border border-black/15 p-6 print:rounded-2xl print:p-2.5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black print:text-[10px]">
                Stay summary
              </p>
              <dl className="mt-4 space-y-3 text-sm text-black print:mt-1.5 print:grid print:grid-cols-2 print:gap-x-4 print:gap-y-1 print:space-y-0 print:text-[9.75px]">
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Arrival</dt>
                  <dd>{formatDate(customer.initialValues.booking.arrivalDate)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Departure</dt>
                  <dd>{formatDate(customer.initialValues.booking.departureDate)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Boarders booked</dt>
                  <dd>{customer.initialValues.booking.boardersBooked || "0"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Days inclusive</dt>
                  <dd>{customer.initialValues.booking.daysInclusive || "0"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-black">Record</dt>
                  <dd>{customer.identifier}</dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="mt-8 rounded-3xl border border-black/15 p-6 print:mt-2.5 print:rounded-2xl print:p-2.5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black print:text-[10px]">
              Boarder details
            </p>
              {boarders.map((boarder) => (
                <article
                  key={boarder.name}
                  className="rounded-2xl p-4 print:rounded-xl print:p-2"
                >
                  <div className="mt-3 grid gap-23 md:grid-cols-2 print:mt-1.5 print:gap-2 print:grid-cols-2">
                    <dl className="space-y-2 text-sm text-black print:space-y-1 print:text-[8.8px]">
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-black">Boarder(s)</dt>
                        <dd>{boarder.name}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-black">Breed</dt>
                        <dd>{boarder.description || "None"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-black">Age</dt>
                        <dd>{boarder.age || "None"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-black">Medications</dt>
                        <dd className="max-w-[58%] text-right">{boarder.medications || "None"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-black">Diet</dt>
                        <dd className="max-w-[58%] text-right">{boarder.specialDiet || "None"}</dd>
                      </div>
                    </dl>
                    <dl className="space-y-2 text-sm text-black print:space-y-1 print:text-[8.8px]">
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-black">Notes</dt>
                        <dd className="max-w-[58%] text-right">{boarder.comments || "None"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-black">Vacc Date</dt>
                        <dd>{formatDate(boarder.vaccinationDate)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-black">K Cough Date</dt>
                        <dd>{formatDate(boarder.kennelCoughDate)}</dd>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-black/15 pt-2 font-semibold text-black print:pt-1">
                        <dt>Daily Rate</dt>
                        <dd>{formatCurrency(boarder.dailyRate)}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              ))}
           </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] print:mt-2.5 print:grid-cols-[1.1fr_0.9fr] print:gap-2">
            <section className="rounded-3xl border border-black/15 p-6 print:rounded-2xl print:p-2.5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black print:text-[10px]">
                Extras and booking notes
              </p>
              <div className="mt-4 space-y-3 text-sm text-black print:mt-1.5 print:space-y-1 print:text-[9.75px]">
                {extras.map((extra) => (
                  <div key={extra.label} className="flex justify-between gap-4">
                    <span>{extra.label}</span>
                    <span className="font-medium text-black">{formatCurrency(extra.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-black/10 bg-slate-50 p-4 text-sm leading-6 text-black print:mt-1.5 print:p-2 print:text-[9px] print:leading-3.25">
                {customer.initialValues.booking.bookingNotes || "No booking notes recorded."}
              </div>
            </section>

            <section className="rounded-3xl border border-black/15 p-6 print:rounded-2xl print:p-2.5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black print:text-[10px]">
                Billing summary
              </p>
              <dl className="mt-4 space-y-3 text-sm text-black print:mt-1.5 print:space-y-1 print:text-[9.75px]">
                <div className="flex justify-between gap-4">
                  <dt>Total daily rate</dt>
                  <dd className="font-medium text-black">{formatCurrency(customer.initialValues.billing.totalDailyRate)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Discount</dt>
                  <dd className="font-medium text-black">{formatCurrency(customer.initialValues.billing.discount)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Extras</dt>
                  <dd className="font-medium text-black">{formatCurrency(customer.initialValues.billing.extras)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Sub total</dt>
                  <dd className="font-medium text-black">{formatCurrency(customer.initialValues.billing.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>VAT @ {customer.initialValues.billing.vatPercent || "0.00"}%</dt>
                  <dd className="font-medium text-black">{formatCurrency("0")}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-black/15 pt-3 text-base font-semibold text-black print:pt-1.5 print:text-[10.25px]">
                  <dt>Total</dt>
                  <dd>{formatCurrency(customer.initialValues.billing.total)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Less paid</dt>
                  <dd className="font-medium text-black">{formatCurrency(customer.initialValues.billing.amountPaid)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-base font-semibold text-black print:text-[10.25px]">
                  <dt>Balance owed</dt>
                  <dd>{formatCurrency(customer.initialValues.billing.balanceOwed)}</dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="mt-8 rounded-3xl border border-black/15 p-6 print:mt-2.5 print:rounded-2xl print:p-2.5">
            <ol className="space-y-3 text-sm leading-6 text-black print:grid print:grid-cols-2 print:gap-x-4 print:gap-y-1 print:space-y-0 print:text-[8.6px] print:leading-[1.22]">
              {billTerms.map((term) => (
                <li key={term} className="flex gap-3">
                  <span className="font-semibold text-black">{billTerms.indexOf(term) + 1})</span>
                  <span>{term}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 text-center text-sm leading-6 text-black print:mt-2 print:text-[8.75px] print:leading-[1.22]">
              <p>
                I agree to board my animal under the above conditions. I also agree that if the animal is not collected within 14 days of the collection date booked and no communication is received from me, the boarding kennel owner has my full authority to sell or otherwise dispose of the animal at the boarding kennel owner&apos;s discretion.
              </p>
              <p className="mt-6 text-base font-bold uppercase tracking-[0.08em] text-black print:mt-2 print:text-[9px] print:leading-[1.28]">
                No animal will be admitted without a current vaccination certificate. We endeavour to maintain the highest standards for the dogs and cats in our care. We cannot therefore at any time accept a dog or cat unvaccinated.
              </p>
            </div>

            <div className="mt-10 print:mt-2.5">
              <p className="text-center text-sm text-black print:text-[8.75px]">
                I have read the above and agree to its contents, terms and conditions.
              </p>
              <div className="mt-8 grid items-end gap-8 md:grid-cols-[minmax(0,1fr)_220px] print:mt-2.5 print:gap-2.5 print:grid-cols-[minmax(0,1fr)_115px]">
                <div>
                  <div className="flex items-end gap-3 text-sm text-black print:text-[8.75px]">
                    <span className="shrink-0">Signed</span>
                    <div className="h-4 flex-1 border-b border-black/40" />
                  </div>
                </div>
                <div className="flex items-end gap-3 text-sm text-black print:text-[8.75px]">
                  <span className="shrink-0">Date</span>
                  <div className="h-4 flex-1 border-b border-black/40" />
                </div>
                <div className="print:col-span-2">
                  <p className="mt-3 text-center text-sm text-black print:mt-1.5 print:text-[8.75px]">
                    Signed by {customer.customerName} or his/her or their representative.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-8 text-center text-black print:mt-2.5 print:text-[8.75px] print:leading-3.25">
            <p className="text-lg font-semibold uppercase tracking-[0.06em] text-black underline underline-offset-4 print:text-[10px]">
              Blairadam Boarding Kennels & Cattery
            </p>
            <p className="mt-2 text-base print:mt-1 print:text-[9px]">Kelty, Fife. KY4 0JN</p>
            <p className="text-base print:text-[9px]">Tel: 01383 830 690</p>
            <p className="text-base print:text-[9px]">Proprietor Morag Ford</p>
          </footer>
        </article>
      </div>
    </main>
  );
}