import Link from "next/link";

type PaginationControlsProps = {
  pathname: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  searchParams?: Record<string, string | string[] | undefined>;
};

function buildHref(
  pathname: string,
  page: number,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (!value || key === "page") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      return;
    }

    params.set(key, value);
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function PaginationControls({
  pathname,
  currentPage,
  totalPages,
  totalItems,
  startItem,
  endItem,
  searchParams,
}: PaginationControlsProps) {
  if (totalItems === 0) {
    return null;
  }

  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <div className="flex flex-col gap-3 rounded-b-4xl border-t border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-center sm:text-left">
        Showing {startItem}-{endItem} of {totalItems}
      </p>
      <div className="flex w-full items-center gap-2 sm:w-auto sm:self-auto">
        <Link
          href={buildHref(pathname, previousPage, searchParams)}
          aria-disabled={currentPage === 1}
          className={[
            "inline-flex flex-1 items-center justify-center rounded-xl border px-3 py-2 font-semibold transition sm:flex-none",
            currentPage === 1
              ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950",
          ].join(" ")}
        >
          Previous
        </Link>
        <span className="min-w-0 flex-1 text-center font-medium text-slate-700 sm:min-w-24 sm:flex-none">
          Page {currentPage} of {totalPages}
        </span>
        <Link
          href={buildHref(pathname, nextPage, searchParams)}
          aria-disabled={currentPage === totalPages}
          className={[
            "inline-flex flex-1 items-center justify-center rounded-xl border px-3 py-2 font-semibold transition sm:flex-none",
            currentPage === totalPages
              ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950",
          ].join(" ")}
        >
          Next
        </Link>
      </div>
    </div>
  );
}