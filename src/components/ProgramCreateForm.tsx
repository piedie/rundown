"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProgramCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const suggestedSlug = useMemo(() => slugify(name), [name]);
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const finalSlug = (slug || suggestedSlug).trim().toLowerCase();
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, slug: finalSlug })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.code ?? "Kon programma niet aanmaken");
        return;
      }

      setName("");
      setSlug("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-1">
        <label className="text-sm text-zinc-700">Naam</label>
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bijv. Nieuws"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm text-zinc-700">Slug</label>
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-mono"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={suggestedSlug || "bijv. nieuws"}
        />
        <div className="text-xs text-zinc-500">Wordt gebruikt in de URL. Moet uniek zijn.</div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <button
        type="submit"
        disabled={busy}
        className="w-fit rounded-md border border-zinc-300 bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {busy ? "Bezig..." : "Aanmaken"}
      </button>
    </form>
  );
}
