import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blairadam Kennel CRM",
  description: "Customer, pet, and visit management for kennel staff.",
  icons: {
    icon: "/icon.svg",
  },
};

const authRoutes = new Set(["/login"]);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isAuthRoute = authRoutes.has(pathname);

  // Some requests can reach the layout without the middleware-injected pathname.
  // In that case, skip layout-level redirects to avoid redirect loops on /login.
  if (pathname) {
    if (!supabaseUrl || !supabaseKey) {
      if (!isAuthRoute) {
        redirect("/login");
      }
    } else {
      const supabase = await getSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && !isAuthRoute) {
        redirect("/login");
      }

      if (user && isAuthRoute) {
        redirect("/customers");
      }
    }
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
