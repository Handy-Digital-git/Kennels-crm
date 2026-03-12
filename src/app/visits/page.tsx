import Link from "next/link";
import { VisitActionsMenu } from "@/components/visit-actions-menu";
import { getSupabaseServerClient } from "@/lib/supabase-server";

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

export default async function VisitsPage() {
  const visits = await getVisitRows();

  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Visits
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            Visit register
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Review every scheduled and completed visit, open a stay record, and settle balances against the correct visit.
          </p>
        </div>

        <section className="rounded-4xl border border-slate-200 bg-white shadow-sm overflow-x-auto lg:overflow-visible">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Visit dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Boarders</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {visits.map((visit) => (
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
                  <td className="px-6 py-5 text-sm font-semibold text-slate-950">{formatCurrency(visit.balanceOwed)}</td>
                  <td className="px-6 py-5 text-right">
                    <VisitActionsMenu visitId={visit.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
    </main>
  );
}