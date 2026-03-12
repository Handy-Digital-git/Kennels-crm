"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronsUpDown,
  Dog,
  X,
  Users,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type AppSidebarProps = {
  className?: string;
  mobile?: boolean;
  onNavigateAction?: () => void;
  onCloseAction?: () => void;
};

type UserProfile = {
  name: string | null;
  email: string | null;
  role: string | null;
};

const navItems = [
  {
    href: "/customers",
    label: "Customers",
    icon: Users,
    iconClassName: "text-sky-600",
    iconActiveClassName: "text-sky-700",
  },
  {
    href: "/pets",
    label: "Pets",
    icon: Dog,
    iconClassName: "text-emerald-600",
    iconActiveClassName: "text-emerald-700",
  },
  {
    href: "/visits",
    label: "Visits",
    icon: CalendarDays,
    iconClassName: "text-amber-600",
    iconActiveClassName: "text-amber-700",
  },
];

export function AppSidebar({ className, mobile = false, onNavigateAction, onCloseAction }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    navItems.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setIsProfileLoading(false);
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      if (!supabase) {
        setProfile(null);
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (userError || !user) {
        setProfile(null);
        setIsProfileLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("name, email, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        setProfile({
          name: (user.user_metadata?.name as string | undefined) ?? null,
          email: user.email ?? null,
          role: null,
        });
        setIsProfileLoading(false);
        return;
      }

      setProfile({
        name:
          data?.name ??
          ((user.user_metadata?.name as string | undefined) ?? null),
        email: data?.email ?? user.email ?? null,
        role: data?.role ?? null,
      });
      setIsProfileLoading(false);
    }

    void loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadProfile();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const displayName = profile?.name?.trim() || "Signed in user";
  const displayEmail = profile?.email?.trim() || "No email available";
  const displayRole = profile?.role?.trim() || "Staff";
  const initialsSource = profile?.name?.trim() || profile?.email?.trim() || "SU";
  const initials = initialsSource
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "SU";

  return (
    <aside
      id={mobile ? "mobile-navigation" : undefined}
      className={[
        "flex h-full w-full flex-col bg-white px-4 py-5",
        mobile ? "border-r border-slate-200" : "max-w-xs border-r border-slate-200",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3 px-2">
        <Link href="/customers" className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9  shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-white shadow-[0_12px_28px_-18px_rgba(15,23,42,0.55)]">
            <Dog className="text-blue-700 h-6.5 w-6.5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight text-slate-900">
              Blairadam
            </h1>
            <p className="truncate text-xs text-slate-500">
              Boarding Kennels and Cattery
            </p>
          </div>
        </Link>
        {mobile ? (
          <button
            type="button"
            onClick={onCloseAction}
            aria-label="Close navigation menu"
            className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center text-blue-700 justify-center rounded-full bg-slate-200 text-[0.7rem] font-semibold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {isProfileLoading ? "Loading profile..." : displayName}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {isProfileLoading ? "Checking account" : displayEmail}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
              {isProfileLoading ? "..." : displayRole}
            </span>
            <ChevronsUpDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1.5 overflow-y-auto">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={onNavigateAction}
              className={[
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 text-slate-950 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute inset-y-1 left-0 w-1 rounded-full transition-colors",
                  isActive ? "bg-blue-600" : "bg-transparent",
                ].join(" ")}
              />
              <Icon
                className={[
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? item.iconActiveClassName
                    : `${item.iconClassName} group-hover:${item.iconActiveClassName}`,
                ].join(" ")}
              />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-500 shadow-sm">
        Manage customers, pets, and visits from one clear workspace.
      </div>
    </aside>
  );
}