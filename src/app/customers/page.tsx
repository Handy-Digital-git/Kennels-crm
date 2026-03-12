import Link from "next/link";
import { ArrowUpRight, Plus, Search } from "lucide-react";
import { customerRecords } from "@/lib/customer-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function CustomersPage() {
  const activeCustomers = customerRecords.filter(
    (customer) => customer.status === "Active",
  ).length;
  const totalBoarders = customerRecords.reduce(
    (sum, customer) => sum + customer.boarders.length,
    0,
  );
  const outstandingBalance = customerRecords.reduce(
    (sum, customer) => sum + customer.balanceDue,
    0,
  );

  return (
    <main className="min-h-screen px-6 py-5 sm:px-8 lg:px-10">
      <section className="mx-auto max-w-8xl space-y-6">
        <div className="flex flex-col gap-4 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Customers
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
              Customer records
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Track owner accounts, active boarders, upcoming stays, and
              balances from one professional customer register.
            </p>
          </div>

          <Link
            href="/customers/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            <span>New customer</span>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Active customers
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              {activeCustomers}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Registered boarders
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              {totalBoarders}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Outstanding balance
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              {formatCurrency(outstandingBalance)}
            </p>
          </div>
        </div>

        <section className="rounded-4xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Customer table
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Review boarding clients, contact details, scheduled stays, and account status.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <label className="flex min-w-[280px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                <Search className="h-4 w-4" />
                <input
                  type="search"
                  placeholder="Search customers or boarders"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>
              <Link
                href="/customers/new"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                <Plus className="h-4 w-4" />
                <span>Add record</span>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Boarders</th>
                  <th className="px-6 py-4">Upcoming stay</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {customerRecords.map((customer) => (
                  <tr key={customer.id} className="align-top transition hover:bg-slate-50/70">
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {customer.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {customer.email}
                        </p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                          {customer.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {customer.boarders.map((boarder) => (
                          <span
                            key={boarder}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100"
                          >
                            {boarder}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {customer.boarders.length} registered
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-slate-900">
                        {customer.upcomingStay}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {customer.nights > 0
                          ? `${customer.nights} nights booked`
                          : "Awaiting first booking"}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      <p>{customer.phone}</p>
                      <p className="mt-1">{customer.town}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-950">
                        {formatCurrency(customer.balanceDue)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {customer.balanceDue > 0 ? "Outstanding" : "Clear"}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
                          customer.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                            : customer.status === "Returning"
                              ? "bg-amber-50 text-amber-700 ring-amber-100"
                              : "bg-slate-100 text-slate-700 ring-slate-200",
                        ].join(" ")}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        href="/customers/new"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                      >
                        <span>Open</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}