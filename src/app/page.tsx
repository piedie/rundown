import { auth } from "@/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Logged in</h1>

      <div className="rounded-lg border border-zinc-200 p-4">
        <div className="text-sm text-zinc-600">User</div>
        <div className="mt-1 font-mono text-sm">
          {session?.user?.email ?? "unknown"}
        </div>
      </div>

      <div className="flex gap-3">
        <a href="/programs" className="rounded-md border border-zinc-300 px-3 py-2 text-sm underline">Programma’s</a>
        <LogoutButton />
      </div>
    </div>
  );
}
