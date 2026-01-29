"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("test@landstede.live");
  const [password, setPassword] = useState("testpassword");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Login</h1>

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);

          const res = await signIn("credentials", {
            email,
            password,
            redirect: false
          });

          if (res?.error) {
            setError("Login mislukt");
          } else {
            // NextAuth types are a bit awkward when redirect=true. We keep it simple.
            window.location.href = "/";
          }
          setBusy(false);
        }}
      >
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input
            className="w-full rounded-md border border-zinc-300 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Wachtwoord</label>
          <input
            className="w-full rounded-md border border-zinc-300 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {busy ? "Bezig..." : "Inloggen"}
        </button>

        <p className="text-xs text-zinc-500">
          Testuser is seeded in Postgres (zie docker init scripts).
        </p>
      </form>
    </div>
  );
}
