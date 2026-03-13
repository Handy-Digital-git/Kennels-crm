import Link from "next/link";
import { LiveSearchInput } from "@/components/live-search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { VisitActionsMenu } from "@/components/visit-actions-menu";
import { getCurrentPage, paginateItems } from "@/lib/pagination";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type VisitsPageProps = {
  searchParams?: Promise<{
    q?: string;
    page?: string;
  }>;
};

type VisitRow = {
  id: string;
  customerName: string;
  customerIdentifier: string;
  arrivalDate: string;
  departureDate: string;
  status: string;
  boardersBooked: number;
  totalAmount: number;
  balanceOwed: number;
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

function isPaidBalance(balance: number) {
  return balance === 0;
}

function getBalanceStatus(balance: number) {
  if (isPaidBalance(balance)) {
    return {
      label: "Paid",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };
  }

  return {
    label: "Outstanding",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  };
}

async function getVisitRows(): Promise<VisitRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  try {
    const supabase = await getSupabaseServerClient();
    const [{ data: visits }, { data: customers }] = await Promise.all([
      supabase
        .from("visits")
        .select("id, customer_id, arrival_date, departure_date, status, boarders_booked, total_amount, balance_owed")
        .order("created_at", { ascending: false }),
      supabase
        .from("customers")
        .select("id, customer_code, name"),
    ]);

    const customersById = new Map(
      (customers ?? []).map((customer) => [customer.id, customer]),
    );

    return (visits ?? []).map((visit) => {
      const customer = customersById.get(visit.customer_id);

      return {
        id: visit.id,
        customerName: customer?.name ?? "Customer",
        customerIdentifier: customer?.customer_code ?? visit.customer_id,
        arrivalDate: visit.arrival_date ?? "",
        departureDate: visit.departure_date ?? "",
        status: formatStatusLabel(visit.status),
        boardersBooked: Number(visit.boarders_booked ?? 0),
        totalAmount: Number(visit.total_amount ?? 0),
        balanceOwed: Number(visit.balance_owed ?? 0),
      };
    });
  } catch {
    return [];
  }
}

function matchesVisitQuery(visit: VisitRow, query: string) {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();

  return [
    visit.id,
    visit.customerName,
    visit.customerIdentifier,
    visit.status,
    visit.arrivalDate,
    visit.departureDate,
    formatDateRange(visit.arrivalDate, visit.departureDate),
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

export default async function VisitsPage({ searchParams }: VisitsPageProps) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams?.q?.trim() ?? "";
  const requestedPage = getCurrentPage(resolvedSearchParams?.page);
  const visits = await getVisitRows();
  const filteredVisits = visits.filter((visit) => matchesVisitQuery(visit, searchQuery));
  const paginatedVisits = paginateItems(filteredVisits, requestedPage);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Visits
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Visit register
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Review every scheduled and completed visit, open a stay record, and settle balances against the correct visit.
          </p>
        </div>

        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Visit table
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Search by customer, visit ID, status, or visit dates.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <LiveSearchInput
                placeholder="Search visits"
                ariaLabel="Search visits"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-200 md:hidden">
            {paginatedVisits.pageItems.map((visit) => {
              const balanceStatus = getBalanceStatus(visit.balanceOwed);

              return (
              <article key={visit.id} className="space-y-4 px-4 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-950">
                      {visit.customerName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {visit.customerIdentifier}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <VisitActionsMenu visitId={visit.id} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {visit.status}
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    {visit.boardersBooked} boarder{visit.boardersBooked === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Visit dates
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {formatDateRange(visit.arrivalDate, visit.departureDate)}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-3">
                  <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Total
                    </dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-950">
                      {formatCurrency(visit.totalAmount)}
                    </dd>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Balance
                    </dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-950">
                      {formatCurrency(visit.balanceOwed)}
                    </dd>
                  </div>
                  <div className="col-span-2 rounded-3xl border border-slate-200 bg-white px-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Payment status
                    </dt>
                    <dd className="mt-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ring-1 ${balanceStatus.className}`}>
                        {balanceStatus.label}
                      </span>
                    </dd>
                  </div>
                </dl>
              </article>
              );
            })}
            {paginatedVisits.totalItems === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-semibold text-slate-950">
                  No visits matched that search.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try a customer name, status, visit ID, or clear the filter.
                </p>
              </div>
            ) : null}
          </div>

          <div className="hidden overflow-x-auto md:block lg:overflow-visible">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Visit dates</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Boarders</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Payment status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedVisits.pageItems.map((visit) => {
                  const balanceStatus = getBalanceStatus(visit.balanceOwed);

                  return (
                  <tr key={visit.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-950">{visit.customerName}</p>
                      <p className="mt-1 text-sm text-slate-500">{visit.customerIdentifier}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-700">
                      {formatDateRange(visit.arrivalDate, visit.departureDate)}
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        {visit.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-700">{visit.boardersBooked}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-950">{formatCurrency(visit.totalAmount)}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-950">
                      {formatCurrency(visit.balanceOwed)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ring-1 ${balanceStatus.className}`}>
                        {balanceStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <VisitActionsMenu visitId={visit.id} />
                    </td>
                  </tr>
                  );
                })}
                {paginatedVisits.totalItems === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center">
                      <p className="text-sm font-semibold text-slate-950">
                        No visits matched that search.
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Try a customer name, status, visit ID, or clear the filter.
                      </p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <PaginationControls
            pathname="/visits"
            currentPage={paginatedVisits.currentPage}
            totalPages={paginatedVisits.totalPages}
            totalItems={paginatedVisits.totalItems}
            startItem={paginatedVisits.startItem}
            endItem={paginatedVisits.endItem}
            searchParams={resolvedSearchParams}
          />
        </section>
      </section>
    </main>
  );
}