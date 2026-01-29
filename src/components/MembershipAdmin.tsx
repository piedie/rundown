"use client";

import { useEffect, useMemo, useState } from "react";

type ProgramRole = "VIEWER" | "EDITOR" | "ADMIN";

type Membership = {
  user_id: string;
  email: string;
  role: ProgramRole;
};

function roleOptions(): ProgramRole[] {
  return ["VIEWER", "EDITOR", "ADMIN"];
}

export function MembershipAdmin({ programId }: { programId: string }) {
  const [memberships, setMemberships] = useState<Membership[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<ProgramRole>("VIEWER");
  const [busy, setBusy] = useState(false);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/programs/${encodeURIComponent(programId)}/memberships`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.code ?? "Kon leden niet laden");
        setMemberships([]);
        return;
      }
      setMemberships((data?.memberships ?? []) as Membership[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/programs/${encodeURIComponent(programId)}/memberships`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: newEmail, role: newRole })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.code ?? "Kon lid niet toevoegen");
        return;
      }
      setNewEmail("");
      setNewRole("VIEWER");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function updateRole(userId: string, role: ProgramRole) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/programs/${encodeURIComponent(programId)}/memberships/${encodeURIComponent(userId)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ role })
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.code ?? "Kon rol niet wijzigen");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(userId: string) {
    if (!confirm("Lid verwijderen?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/programs/${encodeURIComponent(programId)}/memberships/${encodeURIComponent(userId)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.code ?? "Kon lid niet verwijderen");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  const rows = useMemo(() => memberships ?? [], [memberships]);

  return (
    <div className="space-y-5 rounded-lg border border-zinc-200 p-4">
      <div>
        <h2 className="text-lg font-semibold">Leden</h2>
        <p className="mt-1 text-sm text-zinc-600">Voeg gebruikers toe en beheer rollen.</p>
      </div>

      <form onSubmit={addMember} className="grid gap-3 rounded-md bg-zinc-50 p-3">
        <div className="grid gap-1">
          <label className="text-sm text-zinc-700">Email</label>
          <input
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="user@landstede.live"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm text-zinc-700">Rol</label>
          <select
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-mono"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as ProgramRole)}
          >
            {roleOptions().map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={busy || !newEmail.trim()}
          className="w-fit rounded-md border border-zinc-300 bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          Toevoegen
        </button>
      </form>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-600">
            <tr>
              <th className="py-2">Email</th>
              <th className="py-2">Rol</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-3 text-zinc-600" colSpan={3}>
                  Laden...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="py-3 text-zinc-600" colSpan={3}>
                  Geen leden gevonden.
                </td>
              </tr>
            ) : (
              rows.map((m) => (
                <tr key={m.user_id} className="border-t border-zinc-200">
                  <td className="py-2 font-mono">{m.email}</td>
                  <td className="py-2">
                    <select
                      className="rounded-md border border-zinc-300 px-2 py-1 font-mono"
                      value={m.role}
                      disabled={busy}
                      onChange={(e) => updateRole(m.user_id, e.target.value as ProgramRole)}
                    >
                      {roleOptions().map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(m.user_id)}
                      className="text-red-600 underline disabled:opacity-50"
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-zinc-500">
        TODO(audit): membership changes loggen.
      </div>
    </div>
  );
}
