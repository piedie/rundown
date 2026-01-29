import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { getProgramBySlugForUser } from "@/lib/programs";
import { listRundowns } from "@/lib/rundowns";
import { RundownList } from "@/components/RundownList";

export default async function RundownsPage({ params }: { params: { slug: string } }) {
  let user;
  try {
    user = await getCurrentUserOrThrow();
  } catch {
    redirect("/login");
  }

  const program = await getProgramBySlugForUser(user.id, params.slug);
  if (!program) {
    redirect("/programs");
  }

  const rundowns = await listRundowns(program.id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{program.name}</h1>
          <div className="mt-1 text-sm text-zinc-600">
            Slug: <span className="font-mono">{program.slug}</span> · jouw rol:{" "}
            <span className="font-mono">{program.role}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href={`/programs/${encodeURIComponent(program.slug)}/settings/members`} className="text-sm underline">
            Leden
          </Link>
          <Link href="/programs" className="text-sm underline">
            Terug
          </Link>
        </div>
      </div>

      <RundownList programId={program.id} programSlug={program.slug} role={program.role} rundowns={rundowns} />
    </div>
  );
}
