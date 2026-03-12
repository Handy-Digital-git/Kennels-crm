"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type LiveSearchInputProps = {
  paramName?: string;
  placeholder: string;
  ariaLabel: string;
};

export function LiveSearchInput({
  paramName = "q",
  placeholder,
  ariaLabel,
}: LiveSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentValue = searchParams.get(paramName) ?? "";
  const [value, setValue] = useState(currentValue);

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(paramName, value);
      } else {
        params.delete(paramName);
      }

       params.delete("page");

      const nextQuery = params.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      const currentUrl = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      if (nextUrl === currentUrl) {
        return;
      }

      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [paramName, pathname, router, searchParams, value]);

  function handleClear() {
    setValue("");
  }

  return (
    <label className="flex min-w-70 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
      <Search className="h-4 w-4 shrink-0" />
      <input
        type="search"
        value={value}
        aria-label={ariaLabel}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
      {isPending ? <span className="sr-only">Updating search results</span> : null}
    </label>
  );
}