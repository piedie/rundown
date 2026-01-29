import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { getProgramBySlugForUser } from "@/lib/programs";
import { getRundownById } from "@/lib/rundowns";
import { RundownEditor } from "@/components/RundownEditor";

export default async function RundownEditorPage({
  params
}: {
  params: { slug: string; rundownId: string };
}) {
  let user;
  try {
    user = await getCurrentUserOrThrow();
  } catch {
    redirect("/login");
  }

  const program = await getProgramBySlugForUser(user.id, params.slug);
  if (!program) redirect("/programs");

  const rundown = await getRundownById(program.id, params.rundownId);
  if (!rundown) redirect(`/programs/${encodeURIComponent(program.slug)}/rundowns`);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{rundown.title}</h1>
          <div className="mt-1 text-sm text-zinc-600">
            {rundown.date ? <span className="font-mono">{rundown.date}</span> : <span>Geen datum</span>} · status:{" "}
            <span className="font-mono">{rundown.status}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={`/programs/${encodeURIComponent(program.slug)}/rundowns`}
            className="text-sm underline"
          >
            Terug naar lijst
          </Link>
        </div>
      </div>

      <RundownEditor
        programId={program.id}
        programSlug={program.slug}
        role={program.role}
        rundownId={rundown.id}
      />
    </div>
  );
}
