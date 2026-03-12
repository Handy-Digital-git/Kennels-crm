"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronsLeft,
  ChevronsUpDown,
  Dog,
  MoreHorizontal,
  Users,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

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
  },
  {
    href: "/pets",
    label: "Pets",
    icon: Dog,
  },
  {
    href: "/visits",
    label: "Visits",
    icon: CalendarDays,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

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
    <aside className="flex h-full w-full max-w-xs flex-col border-r border-slate-200 bg-white px-4 py-5">
      <div className="flex items-start justify-between gap-3 px-2">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6d4bff,#ff9c63)] text-white shadow-sm">
            <Dog className="h-4.5 w-4.5" strokeWidth={2.2} />
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
        <button
          type="button"
          aria-label="Collapse sidebar"
          className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[0.7rem] font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {isProfileLoading ? "Loading profile..." : displayName}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {isProfileLoading ? "Checking account" : displayEmail}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {isProfileLoading ? "..." : displayRole}
            </span>
            <ChevronsUpDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1.5">
        <div className="mb-2 flex items-center justify-between px-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>
          <button
            type="button"
            aria-label="More options"
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                  : "text-slate-500 hover:bg-white/70 hover:text-slate-800",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute inset-y-1 left-0 w-1 rounded-full transition-colors",
                  isActive ? "bg-[#7c5cff]" : "bg-transparent",
                ].join(" ")}
              />
              <Icon
                className={[
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600",
                ].join(" ")}
              />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-xs leading-5 text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        Manage customers, pets, and visits from one clear workspace.
      </div>
    </aside>
  );
}