import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-950 px-6 py-10 sm:px-10 lg:px-12">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_30%),linear-gradient(135deg,#020617,#0f172a_55%,#111827)]" />
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center">
        <section className="flex w-full max-w-md flex-col items-center justify-center gap-6">
          <div className="text-center text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">
              Blairadam
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Boarding Kennels and Cattery
            </h1>
          </div>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}