"use client";

import { Printer } from "lucide-react";

export function PrintPageButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 print:hidden"
    >
      <Printer className="h-4 w-4" />
      <span>Print now</span>
    </button>
  );
}