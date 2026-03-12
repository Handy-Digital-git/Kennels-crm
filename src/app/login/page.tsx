import { PawPrint, ShieldCheck, Stethoscope } from "lucide-react";
import { LoginForm } from "@/components/login-form";


export default function LoginPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-950 px-6 py-10 sm:px-10 lg:px-12">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_30%),linear-gradient(135deg,#020617,#0f172a_55%,#111827)]" />
      <div className="absolute inset-y-0 left-0 -z-10 hidden w-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)] lg:block" />

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,520px)]">
        <section className="max-w-2xl mb-100 text-white">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur">
          
            Blairadam Boarding Kennels and Cattery
          </div>

          <h1 className="mt-8 max-w-xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
            A professional front desk for your kennel operation.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Give your team a clean, reliable place to handle sign-ins, customer
            communication, pet care details, and visit workflows.
          </p>

          
        </section>

        <section className="flex justify-center lg:justify-end">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}