"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import { LogOut, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { getSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase";

type AppShellProps = {
  children: ReactNode;
};

const authRoutes = new Set(["/login"]);

function isPrintRoute(pathname: string | null) {
  return Boolean(pathname?.endsWith("/print"));
}

function getPageTitle(pathname: string | null) {
  if (!pathname || pathname === "/") {
    return "Customers";
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
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname && authRoutes.has(pathname)) {
      setIsAuthChecking(false);
      return;
    }

    const supabaseClient = getSupabaseBrowserClient();

    if (!supabaseClient) {
      setIsAuthChecking(false);
      router.replace("/login");
      router.refresh();
      return;
    }

    const authenticatedClient = supabaseClient;

    let isMounted = true;

    async function validateSession() {
      const {
        data: { user },
      } = await authenticatedClient.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setIsAuthChecking(false);
        router.replace("/login");
        router.refresh();
        return;
      }

      setIsAuthChecking(false);
    }

    void validateSession();

    const {
      data: { subscription },
    } = authenticatedClient.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      if (!session?.user) {
        setIsAuthChecking(false);
        router.replace("/login");
        router.refresh();
        return;
      }

      setIsAuthChecking(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

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

  if (isAuthChecking) {
    return <div className="min-h-screen bg-slate-100" />;
  }

  if (isPrintRoute(pathname)) {
    return <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white">{children}</div>;
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="hidden lg:sticky lg:top-0 lg:block lg:h-screen">
        <AppSidebar />
      </div>

      <div
        className={[
          "fixed inset-0 z-30 bg-slate-950/35 transition-opacity duration-200 lg:hidden",
          isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        className={[
          "fixed inset-y-0 left-0 z-40 w-full max-w-88 transition-transform duration-200 ease-out lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <AppSidebar
          mobile
          onNavigateAction={() => setIsMobileMenuOpen(false)}
          onCloseAction={() => setIsMobileMenuOpen(false)}
          className="h-full shadow-2xl shadow-slate-950/20"
        />
      </div>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white px-4 py-3 backdrop-blur sm:px-6 sm:py-4 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation menu"
                aria-controls="mobile-navigation"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                  Blairadam
                </p>
                <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                  {pageTitle}
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              aria-label={isSigningOut ? "Signing out" : "Log out"}
              disabled={isSigningOut || !hasSupabasePublicEnv}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-red-400 px-3 py-2.5 text-sm font-semibold text-white transition hover:border-slate-300 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{isSigningOut ? "Signing out..." : "Log out"}</span>
            </button>
          </div>
        </header>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}