import Link from "next/link";
import { ArrowLeft, CalendarDays, CircleDollarSign, Dog, UserRound } from "lucide-react";

const boarders = [
  {
    title: "Boarder 1",
    name: "Iesha",
    description: "Springer",
    age: "2",
    medications: "",
    specialDiet: "Our Food x2",
    comments: "",
    vaccinationDate: "2023-05",
    kennelCoughDate: "",
    dailyRate: "10.00",
  },
  {
    title: "Boarder 2",
    name: "Blu",
    description: "Sprocker",
    age: "2",
    medications: "",
    specialDiet: "Our Food x2",
    comments: "",
    vaccinationDate: "2023-05",
    kennelCoughDate: "",
    dailyRate: "10.00",
  },
  {
    title: "Boarder 3",
    name: "Kase",
    description: "Sprocer",
    age: "4",
    medications: "",
    specialDiet: "Our Food x2",
    comments: "",
    vaccinationDate: "2023-05",
    kennelCoughDate: "",
    dailyRate: "10.00",
  },
];

const extras = [
  { label: "Grooming", value: "0.00" },
  { label: "Pickup / Delivery", value: "0.00" },
  { label: "Medication", value: "0.00" },
  { label: "Vets Fees", value: "0.00" },
  { label: "Training", value: "0.00" },
  { label: "Total Extras", value: "0.00" },
];

const billing = [
  { label: "Total Daily Rate", value: "30.00" },
  { label: "Total Days", value: "8" },
  { label: "Discount", value: "0.00" },
  { label: "Extras", value: "0.00" },
  { label: "Sub Total", value: "240.00" },
  { label: "VAT %", value: "0.00" },
  { label: "Total", value: "240.00" },
  { label: "Less Paid", value: "0.00" },
  { label: "Balance Owed", value: "240.00" },
];

function Field({
  label,
  type = "text",
  placeholder,
  defaultValue,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

export default function NewCustomerPage() {
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
              New customer
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
              Customer and boarding intake form
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Capture the customer record, boarder details, care instructions, and pricing from the boarding sheet in one structured form.
            </p>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
            Pre-filled with the example sheet details so you can shape the workflow before wiring it to live data.
          </div>
        </div>

        <form className="space-y-6">
          <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-950 p-3 text-white">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Customer details
                </h3>
                <p className="text-sm text-slate-500">
                  Primary owner contact information and account setup.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Customer name" placeholder="Enter full name" />
              <Field label="Email address" type="email" placeholder="name@example.com" />
              <Field label="Phone number" type="tel" placeholder="07xxx xxxxxx" />
              <Field label="Address line 1" placeholder="Street and number" />
              <Field label="Town / City" placeholder="Town or city" />
              <Field label="Postcode" placeholder="Postcode" />
              <Field label="Emergency contact name" placeholder="Emergency contact" />
              <Field label="Emergency contact phone" type="tel" placeholder="Emergency phone" />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Account status
                </span>
                <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100">
                  <option>Active</option>
                  <option>New</option>
                  <option>Returning</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-600 p-3 text-white">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Booking overview
                </h3>
                <p className="text-sm text-slate-500">
                  Stay dates, number of boarders, and general booking notes.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Arrival date" type="date" defaultValue="2022-11-29" />
              <Field label="Departure date" type="date" defaultValue="2022-12-06" />
              <Field label="Boarders booked" type="number" defaultValue="3" />
              <Field label="Days inclusive" type="number" defaultValue="8" />
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Booking notes
              </span>
              <textarea
                rows={4}
                defaultValue="Boarders booked for 8 days, inclusive stay."
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </section>

          <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-600 p-3 text-white">
                <Dog className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Boarder details
                </h3>
                <p className="text-sm text-slate-500">
                  Capture the animal profile, feeding, medication, and vaccination details for each boarder.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {boarders.map((boarder) => (
                <div
                  key={boarder.title}
                  className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                >
                  <h4 className="text-base font-semibold text-slate-950">
                    {boarder.title}
                  </h4>
                  <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <Field label="Boarder name" defaultValue={boarder.name} />
                    <Field label="Description / breed" defaultValue={boarder.description} />
                    <Field label="Age" type="number" defaultValue={boarder.age} />
                    <Field label="Medications" defaultValue={boarder.medications} placeholder="Medication details" />
                    <Field label="Special diet" defaultValue={boarder.specialDiet} />
                    <Field label="Daily rate" type="number" defaultValue={boarder.dailyRate} />
                    <Field label="Vaccination date" type="month" defaultValue={boarder.vaccinationDate} />
                    <Field label="Kennel cough date" type="month" defaultValue={boarder.kennelCoughDate} />
                    <label className="block md:col-span-2 xl:col-span-1">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Comments
                      </span>
                      <textarea
                        rows={3}
                        defaultValue={boarder.comments}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
            <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-500 p-3 text-white">
                  <CircleDollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">
                    Extras and services
                  </h3>
                  <p className="text-sm text-slate-500">
                    Additional service charges listed on the booking sheet.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {extras.map((item) => (
                  <Field
                    key={item.label}
                    label={item.label}
                    type="number"
                    defaultValue={item.value}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-950">
                Billing summary
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Totals taken directly from the paper booking sheet.
              </p>

              <div className="mt-6 space-y-4">
                {billing.map((item) => (
                  <Field
                    key={item.label}
                    label={item.label}
                    type="number"
                    defaultValue={item.value}
                  />
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-950">
              Terms and care reminders
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              All dogs must be fully vaccinated against distemper, hepatitis, leptospirosis, canine parvovirus, and relevant kennel cough cover before boarding is confirmed.
            </p>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/customers"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Save customer
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}