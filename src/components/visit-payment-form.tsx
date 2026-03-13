"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { settleVisitBill } from "@/app/customers/actions";

type VisitPaymentFormProps = {
  visitId: string;
  initialAmountPaid: number;
  totalAmount: number;
};

export function VisitPaymentForm({
  visitId,
  initialAmountPaid,
  totalAmount,
}: VisitPaymentFormProps) {
  const router = useRouter();
  const [amountPaid, setAmountPaid] = useState(initialAmountPaid.toFixed(2));
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    startTransition(async () => {
      const result = await settleVisitBill(visitId, amountPaid);

      if (result && "error" in result && result.error) {
        setServerError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Amount paid for this visit
        </span>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-400">
            £
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amountPaid}
            onChange={(event) => setAmountPaid(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </label>

      {serverError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {serverError}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-y-3 pt-1">
        <button
          type="button"
          onClick={() => setAmountPaid(totalAmount.toFixed(2))}
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-500"
        >
          Mark as fully paid
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          <span>{isPending ? "Saving..." : "Save payment"}</span>
        </button>
      </div>
    </form>
  );
}