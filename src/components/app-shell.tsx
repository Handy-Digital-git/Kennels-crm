"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { getSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase";

type AppShellProps = {
  children: ReactNode;
};

const authRoutes = new Set(["/login"]);

function getPageTitle(pathname: string | null) {
  if (!pathname || pathname === "/") {
    return "Dashboard";
  }

  const [segment] = pathname.replace(/^\//, "").split("/");

  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, startTransition] = useTransition();

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();

    if (supabase) {
      await supabase.auth.signOut();
    }

    startTransition(() => {
      router.replace("/login");
      router.refresh();
    });
  }

  if (pathname && authRoutes.has(pathname)) {
    return <div className="min-h-screen bg-slate-950 text-slate-50">{children}</div>;
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-0 lg:h-screen">
        <AppSidebar />
      </div>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white px-6 py-4 backdrop-blur sm:px-8 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                {pageTitle}
              </h1>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut || !hasSupabasePublicEnv}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-red-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-slate-300 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
            </button>
          </div>
        </header>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}