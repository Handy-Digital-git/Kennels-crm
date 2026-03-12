"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import {
  getSupabaseBrowserClient,
  hasSupabasePublicEnv,
} from "@/lib/supabase";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setErrorMessage(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to continue.",
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    startTransition(() => {
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-md rounded-4xl border border-white/10 bg-white/95 p-8 text-slate-900 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-10">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-950/30">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Staff Login
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Welcome back
          </h1>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-600">
        Sign in to manage bookings, customer records, pet profiles, and daily
        visit activity.
      </p>

      {!hasSupabasePublicEnv ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase keys are missing from your environment. Add
          NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your
          local env file before signing in.
        </div>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Email address
          </span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Mail className="h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="you@kennelcrm.com"
              autoComplete="email"
              required
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Password
          </span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <LockKeyhole className="h-4 w-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>
        </label>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending || !hasSupabasePublicEnv}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isPending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>Signing in</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-500">
        <span>Protected by Supabase Auth</span>
        <Link href="https://supabase.com/dashboard" className="font-semibold text-blue-600 hover:text-blue-500">
          Open dashboard
        </Link>
      </div>
    </div>
  );
}