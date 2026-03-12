export default function PetsPage() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto max-w-5xl rounded-4xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Pets
        </p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
          Pet profiles
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          This section will hold dog details, medical notes, feeding routines,
          and boarding preferences.
        </p>
      </section>
    </main>
  );
}