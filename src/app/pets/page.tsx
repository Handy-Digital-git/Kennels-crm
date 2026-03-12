import { Search } from "lucide-react";
import { PetActionsMenu } from "@/components/pet-actions-menu";
import { getPetListItems } from "@/lib/customer-form-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function PetsPage() {
  const pets = await getPetListItems();
  const petsWithUpcomingStay = pets.filter(
    (pet) => pet.upcomingStay !== "No booking scheduled",
  ).length;
  const medicatedPets = pets.filter(
    (pet) => pet.medications !== "None recorded",
  ).length;

  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Pets
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            Pet profiles
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Review each pet profile, check care instructions before arrival, and jump straight to the owner record when something needs updated.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Total pets
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{pets.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Upcoming stays
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{petsWithUpcomingStay}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Medication notes
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{medicatedPets}</p>
          </div>
        </div>

        <section className="rounded-4xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">Active pet list</h3>
              <p className="mt-1 text-sm text-slate-500">
                Open a profile to review feeding, medication, and visit history.
              </p>
            </div>

            <label className="flex min-w-70 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              <Search className="h-4 w-4" />
              <input
                type="search"
                placeholder="Search coming next"
                disabled
                className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />
            </label>
          </div>

          <div className="overflow-x-auto lg:overflow-visible">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Pet</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Care profile</th>
                  <th className="px-6 py-4">Upcoming stay</th>
                  <th className="px-6 py-4">Rate</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {pets.map((pet) => (
                  <tr key={pet.id} className="align-top transition hover:bg-slate-50/70">
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-950">{pet.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{pet.breedDescription}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {pet.ageYears ? `${pet.ageYears} years old` : "Age not recorded"}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-950">{pet.ownerName}</p>
                      <p className="mt-1 text-sm text-slate-500">{pet.ownerIdentifier}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      <p>{pet.medications}</p>
                      <p className="mt-2 text-slate-500">{pet.specialDiet}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-700">{pet.upcomingStay}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-950">{formatCurrency(pet.dailyRate)}</td>
                    <td className="px-6 py-5 text-right">
                      <PetActionsMenu
                        petId={pet.id}
                        ownerIdentifier={pet.ownerIdentifier}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}