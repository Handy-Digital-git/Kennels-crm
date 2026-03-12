import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, Dog, Pill } from "lucide-react";
import { getPetDetailRecord } from "@/lib/customer-form-data";

type PetDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatVisitRange(arrivalDate: string, departureDate: string) {
  if (!arrivalDate || !departureDate) {
    return "Dates not set";
  }

  return `${new Date(`${arrivalDate}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} - ${new Date(`${departureDate}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function formatPetRecordId(value: string) {
  if (value.startsWith("pet-")) {
    return value
      .replace(/^pet-/, "PET-")
      .split("-")
      .slice(0, 3)
      .join("-")
      .toUpperCase();
  }

  if (value.length <= 12) {
    return value.toUpperCase();
  }

  return `PET-${value.slice(0, 8).toUpperCase()}`;
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default async function PetDetailPage({ params }: PetDetailPageProps) {
  const { id } = await params;
  const pet = await getPetDetailRecord(id);

  if (!pet) {
    notFound();
  }

  const displayPetId = formatPetRecordId(pet.id);

  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <Link
            href="/pets"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to pets</span>
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Pet profile
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
                {pet.name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                {pet.breedDescription}. Owner: {pet.ownerName}. Upcoming stay: {pet.upcomingStay}.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              Record: <span className="font-semibold text-slate-900">{displayPetId}</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Dog className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Breed
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {pet.breedDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                    <Dog className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Age
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {pet.ageYears ? `${pet.ageYears} years` : "Not recorded"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Vaccination
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{pet.vaccinationDate}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Kennel cough
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{pet.kennelCoughDate}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Daily rate
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formatCurrency(pet.dailyRate)} / day
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Upcoming stay
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {pet.upcomingStay}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                    Full pet record
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    Identity, health, and care details
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <DetailItem label="Pet ID" value={displayPetId} />
                <DetailItem label="Name" value={pet.name} />
                <DetailItem label="Breed" value={pet.breedDescription} />
                <DetailItem
                  label="Age"
                  value={pet.ageYears ? `${pet.ageYears} years` : "Not recorded"}
                />
                <DetailItem label="Vaccination date" value={pet.vaccinationDate} />
                <DetailItem label="Kennel cough date" value={pet.kennelCoughDate} />
                <DetailItem label="Daily rate" value={`${formatCurrency(pet.dailyRate)} / day`} />
                <DetailItem label="Upcoming stay" value={pet.upcomingStay} />
                <DetailItem label="Owner" value={pet.ownerName} />
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Medication
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{pet.medications}</p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Diet
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{pet.specialDiet}</p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  General notes
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{pet.comments}</p>
              </div>
            </section>

            <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                    Stay history
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    Previous and upcoming stays
                  </h2>
                </div>

                <Link
                  href={`/customers/${pet.ownerIdentifier}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                >
                  <span>Open owner record</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {pet.stayHistory.length > 0 ? (
                  pet.stayHistory.map((visit) => (
                    <div
                      key={visit.visitId}
                      className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-950">
                              {formatVisitRange(visit.arrivalDate, visit.departureDate)}
                            </h3>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                              {visit.status}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">{visit.comments || "No visit notes recorded."}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-105">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Rate</p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">{formatCurrency(visit.dailyRate)} / day</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Medication</p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">{visit.medications}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Diet</p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">{visit.specialDiet}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No stay history recorded for this pet yet.
                  </div>
                )}
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Owner
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                {pet.ownerName}
              </h2>

              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Customer record</p>
                  <p className="mt-1 font-semibold text-slate-950">{pet.ownerIdentifier}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Phone</p>
                  <p className="mt-1 font-semibold text-slate-950">{pet.ownerPhone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Email</p>
                  <p className="mt-1 font-semibold text-slate-950 break-all">{pet.ownerEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Town / City</p>
                  <p className="mt-1 font-semibold text-slate-950">{pet.ownerTownCity}</p>
                </div>
              </div>

              <Link
                href={`/customers/${pet.ownerIdentifier}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
              >
                <span>Open full owner record</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}