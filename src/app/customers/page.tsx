import Link from "next/link";
import { Plus } from "lucide-react";
import { CustomerActionsMenu } from "@/components/customer-actions-menu";
import { LiveSearchInput } from "@/components/live-search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { customerRecords } from "@/lib/customer-data";
import { getCurrentPage, paginateItems } from "@/lib/pagination";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type CustomersPageProps = {
  searchParams?: Promise<{
    q?: string;
    page?: string;
  }>;
};

type CustomerTableRow = {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  town: string;
  boarders: string[];
  upcomingStay: string;
  nights: number;
  balanceDue: number;
  status: "Active" | "New" | "Returning";
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDateRange(arrivalDate?: string | null, departureDate?: string | null) {
  if (!arrivalDate || !departureDate) {
    return "No booking scheduled";
  }

  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);

  if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime())) {
    return "No booking scheduled";
  }

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

function getInclusiveDays(arrivalDate?: string | null, departureDate?: string | null) {
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

function parseNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function getCustomerRows(): Promise<CustomerTableRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return customerRecords.map((customer) => ({
      ...customer,
      customerId: customer.id,
    }));
  }

  try {
    const supabase = await getSupabaseServerClient();
    const [{ data: customers, error: customersError }, { data: pets, error: petsError }, { data: visits, error: visitsError }] = await Promise.all([
      supabase
        .from("customers")
        .select("id, customer_code, name, email, phone, town_city, status")
        .order("created_at", { ascending: false }),
      supabase
        .from("pets")
        .select("id, customer_id, name"),
      supabase
        .from("visits")
        .select("id, customer_id, arrival_date, departure_date, days_inclusive, total_amount, amount_paid, balance_owed, status, created_at"),
    ]);

    if (customersError || petsError || visitsError || !customers) {
      return customerRecords.map((customer) => ({
        ...customer,
        customerId: customer.id,
      }));
    }

    const petsByCustomerId = new Map<string, string[]>();

    for (const pet of pets ?? []) {
      if (!pet.customer_id || !pet.name) {
        continue;
      }

      const currentPets = petsByCustomerId.get(pet.customer_id) ?? [];
      currentPets.push(pet.name);
      petsByCustomerId.set(pet.customer_id, currentPets);
    }

    const visitsByCustomerId = new Map<string, typeof visits>();

    for (const visit of visits ?? []) {
      if (!visit.customer_id) {
        continue;
      }

      const currentVisits = visitsByCustomerId.get(visit.customer_id) ?? [];
      currentVisits.push(visit);
      visitsByCustomerId.set(visit.customer_id, currentVisits);
    }

    const today = new Date();

    return customers.map((customer) => {
      const customerVisits = [...(visitsByCustomerId.get(customer.id) ?? [])];

      customerVisits.sort((left, right) => {
        const leftDate = new Date(left.arrival_date ?? 0).getTime();
        const rightDate = new Date(right.arrival_date ?? 0).getTime();
        return leftDate - rightDate;
      });

      const upcomingVisit =
        customerVisits.find((visit) => {
          if (!visit.departure_date) {
            return false;
          }

          return new Date(visit.departure_date) >= today;
        }) ?? customerVisits.at(-1);

      const balanceDue = customerVisits.reduce((sum, visit) => {
        return sum + parseNumber(visit.balance_owed);
      }, 0);

      const upcomingNights = upcomingVisit
        ? parseNumber(upcomingVisit.days_inclusive) || getInclusiveDays(
            upcomingVisit.arrival_date,
            upcomingVisit.departure_date,
          )
        : 0;

      return {
        id: customer.customer_code ?? customer.id,
        customerId: customer.id,
        name: customer.name,
        email: customer.email ?? "No email recorded",
        phone: customer.phone ?? "No phone recorded",
        town: customer.town_city ?? "No town recorded",
        boarders: petsByCustomerId.get(customer.id) ?? [],
        upcomingStay: formatDateRange(
          upcomingVisit?.arrival_date,
          upcomingVisit?.departure_date,
        ),
        nights: upcomingNights,
        balanceDue,
        status: customer.status,
      };
    });
  } catch {
    return customerRecords.map((customer) => ({
      ...customer,
      customerId: customer.id,
    }));
  }
}

function matchesCustomerQuery(customer: CustomerTableRow, query: string) {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();

  return [
    customer.id,
    customer.customerId,
    customer.name,
    customer.email,
    customer.phone,
    customer.town,
    customer.upcomingStay,
    customer.status,
    ...customer.boarders,
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

function getStatusBadgeClassName(status: CustomerTableRow["status"]) {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    case "Returning":
      return "bg-amber-50 text-amber-700 ring-amber-100";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams?.q?.trim() ?? "";
  const requestedPage = getCurrentPage(resolvedSearchParams?.page);
  const rows = await getCustomerRows();
  const filteredRows = rows.filter((customer) => matchesCustomerQuery(customer, searchQuery));
  const paginatedRows = paginateItems(filteredRows, requestedPage);
  const activeCustomers = rows.filter(
    (customer) => customer.status === "Active",
  ).length;
  const totalBoarders = rows.reduce(
    (sum, customer) => sum + customer.boarders.length,
    0,
  );
  const outstandingBalance = rows.reduce(
    (sum, customer) => sum + customer.balanceDue,
    0,
  );

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-4xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Customers
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Customer records
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Track owner accounts, active boarders, upcoming stays, and
              balances from one professional customer register.
            </p>
          </div>

          <Link
            href="/customers/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
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

        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Customer table
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Review boarding clients, contact details, scheduled stays, and account status.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <LiveSearchInput
                placeholder="Search customers or boarders"
                ariaLabel="Search customers or boarders"
              />
              <Link
                href="/customers/new"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add record</span>
              </Link>
            </div>
          </div>

          <div className="divide-y divide-slate-200 md:hidden">
            {paginatedRows.pageItems.map((customer) => (
              <article key={customer.id} className="space-y-4 px-4 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-950">
                      {customer.name}
                    </p>
                    <p className="mt-1 break-all text-sm text-slate-500">
                      {customer.email}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {customer.id}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <CustomerActionsMenu customerId={customer.id} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
                      getStatusBadgeClassName(customer.status),
                    ].join(" ")}
                  >
                    {customer.status}
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    {customer.boarders.length} boarder{customer.boarders.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Upcoming stay
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {customer.upcomingStay}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {customer.nights > 0
                      ? `${customer.nights} nights booked`
                      : "Awaiting first booking"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {customer.boarders.length > 0 ? customer.boarders.map((boarder) => (
                    <span
                      key={boarder}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                    >
                      {boarder}
                    </span>
                  )) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                      No boarders recorded
                    </span>
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-3">
                  <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Contact
                    </dt>
                    <dd className="mt-2 text-sm font-medium text-slate-900">
                      {customer.phone}
                    </dd>
                    <dd className="mt-1 text-sm text-slate-500">
                      {customer.town}
                    </dd>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Balance
                    </dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-950">
                      {formatCurrency(customer.balanceDue)}
                    </dd>
                    <dd className="mt-1 text-sm text-slate-500">
                      {customer.balanceDue > 0 ? "Outstanding" : "Clear"}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
            {paginatedRows.totalItems === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-semibold text-slate-950">
                  No customers matched that search.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try a customer, boarder, email, phone number, or town.
                </p>
              </div>
            ) : null}
          </div>

          <div className="hidden overflow-x-auto md:block lg:overflow-visible">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Boarders</th>
                  <th className="px-6 py-4">Upcoming stay</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedRows.pageItems.map((customer) => (
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
                          getStatusBadgeClassName(customer.status),
                        ].join(" ")}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <CustomerActionsMenu customerId={customer.id} />
                    </td>
                  </tr>
                ))}
                {paginatedRows.totalItems === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center">
                      <p className="text-sm font-semibold text-slate-950">
                        No customers matched that search.
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Try a customer, boarder, email, phone number, or town.
                      </p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <PaginationControls
            pathname="/customers"
            currentPage={paginatedRows.currentPage}
            totalPages={paginatedRows.totalPages}
            totalItems={paginatedRows.totalItems}
            startItem={paginatedRows.startItem}
            endItem={paginatedRows.endItem}
            searchParams={resolvedSearchParams}
          />
        </section>
      </section>
    </main>
  );
}