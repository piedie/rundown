import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { canBootstrapFirstProgram, listProgramsForUser, userIsAdminAnywhere } from "@/lib/programs";
import { ProgramCreateForm } from "@/components/ProgramCreateForm";

export default async function ProgramsPage() {
  let user;
  try {
    user = await getCurrentUserOrThrow();
  } catch {
    redirect("/login");
  }

  const programs = await listProgramsForUser(user.id);
  const canCreate = (await userIsAdminAnywhere(user.id)) || (await canBootstrapFirstProgram(user.id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Programma’s</h1>
          <p className="mt-1 text-sm text-zinc-600">Je ziet alleen programma’s waar je rechten op hebt.</p>
        </div>
        <Link href="/" className="text-sm text-zinc-700 underline">
          Home
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-700">
          Nog geen programma’s.
        </div>
      ) : (
        <div className="grid gap-3">
          {programs.map((p) => (
            <div key={p.id} className="rounded-lg border border-zinc-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-medium">{p.name}</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    <span className="font-mono">{p.slug}</span> · rol: <span className="font-mono">{p.role}</span>
                  </div>
                </div>
                <Link
                  href={`/programs/${encodeURIComponent(p.slug)}/settings/members`}
                  className="text-sm underline"
                >
                  Leden
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {canCreate ? (
        <div className="rounded-lg border border-zinc-200 p-4">
          <h2 className="text-lg font-semibold">Programma aanmaken</h2>
          <p className="mt-1 text-sm text-zinc-600">Alleen ADMIN kan programma’s aanmaken.</p>
          <div className="mt-4">
            <ProgramCreateForm />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
          Je hebt geen rechten om programma’s aan te maken.
        </div>
      )}
    </div>
  );
}
