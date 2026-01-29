"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RundownRow, RundownStatus } from "@/lib/rundowns";
import type { ProgramRole } from "@/lib/permissions";

function canEdit(role: ProgramRole): boolean {
  return role === "EDITOR" || role === "ADMIN";
}

const STATUS_OPTIONS: RundownStatus[] = ["DRAFT", "READY", "PROD", "ARCHIVED"];

export function RundownList(props: {
  programId: string;
  role: ProgramRole;
  rundowns: RundownRow[];
}) {
  const router = useRouter();
  const editable = canEdit(props.role);

  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createNewRundown(e: React.FormEvent) {
    e.preventDefault();
    if (!editable) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/programs/${encodeURIComponent(props.programId)}/rundowns`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: newTitle, date: newDate || null })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.code ?? "Kon rundown niet aanmaken");
        return;
      }

      setNewTitle("");
      setNewDate("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(rundownId: string, status: RundownStatus) {
    if (!editable) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/programs/${encodeURIComponent(props.programId)}/rundowns/${encodeURIComponent(rundownId)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status })
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.code ?? "Kon status niet wijzigen");
        return;
      }

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function copyRundown(sourceId: string) {
    if (!editable) return;

    const title = window.prompt("Nieuwe titel voor de kopie:", "Kopie");
    if (!title) return;

    const date = window.prompt(
      "Nieuwe datum (YYYY-MM-DD), of leeg laten:",
      ""
    );

    setError(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/programs/${encodeURIComponent(props.programId)}/rundowns/${encodeURIComponent(sourceId)}/copy`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, date: (date ?? "").trim() || null })
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.code ?? "Kon rundown niet kopiëren");
        return;
      }

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {editable ? (
        <div className="rounded-lg border border-zinc-200 p-4">
          <h2 className="text-lg font-semibold">Rundown aanmaken</h2>
          <form onSubmit={createNewRundown} className="mt-4 grid gap-3">
            <div className="grid gap-1">
              <label className="text-sm text-zinc-700">Titel</label>
              <input
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Bijv. Dagstart"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm text-zinc-700">Datum (optioneel)</label>
              <input
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-mono"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
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
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-700">
          Je hebt <span className="font-mono">VIEWER</span>-rechten: je kunt alleen lezen.
        </div>
      )}

      <div className="grid gap-3">
        {props.rundowns.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-700">Nog geen rundowns.</div>
        ) : (
          props.rundowns.map((r) => (
            <div key={r.id} className="rounded-lg border border-zinc-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-medium">{r.title}</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    {r.date ? <span className="font-mono">{r.date}</span> : <span>Geen datum</span>} · status:{" "}
                    <span className="font-mono">{r.status}</span>
                  </div>
                </div>

                {editable ? (
                  <div className="flex items-center gap-2">
                    <select
                      className="rounded-md border border-zinc-300 px-2 py-1 text-sm font-mono"
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value as RundownStatus)}
                      disabled={busy}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                      onClick={() => copyRundown(r.id)}
                      disabled={busy}
                    >
                      Kopiëren
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
