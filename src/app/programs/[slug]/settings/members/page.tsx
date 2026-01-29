import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { getProgramBySlugForUser } from "@/lib/programs";
import { MembershipAdmin } from "@/components/MembershipAdmin";

export default async function MembersPage({ params }: { params: { slug: string } }) {
  let user;
  try {
    user = await getCurrentUserOrThrow();
  } catch {
    redirect("/login");
  }

  const program = await getProgramBySlugForUser(user.id, params.slug);
  if (!program) {
    // user has no membership to this program
    redirect("/programs");
  }

  const isAdmin = program.role === "ADMIN";

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
        <Link href="/programs" className="text-sm underline">
          Terug
        </Link>
      </div>

      {isAdmin ? (
        <MembershipAdmin programId={program.id} />
      ) : (
        <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-700">
          Alleen <span className="font-mono">ADMIN</span> kan leden beheren.
        </div>
      )}
    </div>
  );
}
