"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { deleteVisit } from "@/app/customers/actions";

type DeleteVisitButtonProps = {
  visitId: string;
  redirectTo?: string;
  variant?: "inline" | "ghost";
};

export function DeleteVisitButton({
  visitId,
  redirectTo,
  variant = "ghost",
}: DeleteVisitButtonProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setServerError(null);

    const confirmed = window.confirm(
      "Delete this visit? This removes the stay record, visit pets, and visit extras.",
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteVisit(visitId);

      if (result && "error" in result && result.error) {
        setServerError(result.error);
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
      }

      router.refresh();
    });
  }

  const className =
    variant === "inline"
      ? "inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
      : "inline-flex items-center gap-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className={className}
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        <span>{isPending ? "Deleting..." : "Delete visit"}</span>
      </button>

      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}
    </div>
  );
}