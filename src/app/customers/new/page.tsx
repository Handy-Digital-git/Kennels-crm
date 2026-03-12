import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewCustomerForm } from "@/components/new-customer-form";

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

        <NewCustomerForm />
      </div>
    </main>
  );
}