import Link from "next/link";
import { ArrowUpRight, MoreHorizontal, Printer } from "lucide-react";

type CustomerActionsMenuProps = {
  customerId: string;
};

export function CustomerActionsMenu({ customerId }: CustomerActionsMenuProps) {
  return (
    <details className="group relative inline-block text-left">
      <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 [&::-webkit-details-marker]:hidden">
        <MoreHorizontal className="h-4 w-4" />
      </summary>

      <div className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
        <Link
          href={`/customers/${customerId}`}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
        >
          <ArrowUpRight className="h-4 w-4" />
          <span>Open record</span>
        </Link>
        <Link
          href={`/customers/${customerId}/print`}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
        >
          <Printer className="h-4 w-4" />
          <span>Print Bill</span>
        </Link>
      </div>
    </details>
  );
}