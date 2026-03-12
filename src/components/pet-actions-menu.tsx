import Link from "next/link";
import { ArrowUpRight, MoreHorizontal, Users } from "lucide-react";
import { DeletePetButton } from "@/components/delete-pet-button";

type PetActionsMenuProps = {
  petId: string;
  ownerIdentifier: string;
};

export function PetActionsMenu({ petId, ownerIdentifier }: PetActionsMenuProps) {
  return (
    <details className="group inline-block text-left">
      <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 [&::-webkit-details-marker]:hidden">
        <MoreHorizontal className="h-4 w-4" />
      </summary>

      <div className="absolute right-10 z-20 mt-2 w-[18rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
        <Link
          href={`/pets/${petId}`}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
        >
          <ArrowUpRight className="h-4 w-4" />
          <span>Open pet profile</span>
        </Link>
        <Link
          href={`/customers/${ownerIdentifier}`}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
        >
          <Users className="h-4 w-4" />
          <span>Open owner record</span>
        </Link>
        <div className="rounded-xl px-3 py-2 hover:bg-slate-50">
          <DeletePetButton petId={petId} />
        </div>
      </div>
    </details>
  );
}