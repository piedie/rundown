import { auth } from "@/auth";
import { getPool } from "@/lib/db";

export type CurrentUser = {
  id: string;
  email: string;
};

type DbUserRow = {
  id: string;
  email: string;
};

/**
 * Server-side: returns the current authenticated user (id + email) or throws.
 * Avoids relying on session containing id (we resolve via users table).
 */
export async function getCurrentUserOrThrow(): Promise<CurrentUser> {
  const session = await auth();
  const email = session?.user?.email?.toString().trim().toLowerCase();

  if (!email) {
    throw new Error("UNAUTHENTICATED");
  }

  const pool = getPool();
  const { rows } = await pool.query<DbUserRow>(
    "select id, email from users where email = $1 limit 1",
    [email]
  );

  const user = rows[0];
  if (!user) {
    // Should not happen: authenticated user must exist in DB.
    throw new Error("USER_NOT_FOUND");
  }

  return { id: user.id, email: user.email };
}
