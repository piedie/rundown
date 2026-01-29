import { getPool } from "@/lib/db";
import type { ProgramRole } from "@/lib/permissions";
import { hasAtLeastRole } from "@/lib/permissions";

export type ProgramRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type ProgramMembershipRow = {
  program_id: string;
  user_id: string;
  role: ProgramRole;
  created_at: string;
};

type DbCountRow = { n: string };

export async function listProgramsForUser(userId: string): Promise<Array<ProgramRow & { role: ProgramRole }>> {
  const pool = getPool();
  const { rows } = await pool.query<
    ProgramRow & { role: ProgramRole }
  >(
    `
    select p.id, p.name, p.slug, p.created_at, m.role
    from programs p
    join program_memberships m on m.program_id = p.id
    where m.user_id = $1
    order by p.created_at asc
    `,
    [userId]
  );
  return rows;
}

export async function getProgramBySlugForUser(
  userId: string,
  slug: string
): Promise<(ProgramRow & { role: ProgramRole }) | null> {
  const pool = getPool();
  const { rows } = await pool.query<ProgramRow & { role: ProgramRole }>(
    `
    select p.id, p.name, p.slug, p.created_at, m.role
    from programs p
    join program_memberships m on m.program_id = p.id
    where m.user_id = $1 and p.slug = $2
    limit 1
    `,
    [userId, slug]
  );
  return rows[0] ?? null;
}

export async function getUserRoleInProgram(userId: string, programId: string): Promise<ProgramRole | null> {
  const pool = getPool();
  const { rows } = await pool.query<{ role: ProgramRole }>(
    "select role from program_memberships where user_id = $1 and program_id = $2 limit 1",
    [userId, programId]
  );
  return rows[0]?.role ?? null;
}

/**
 * Bootstrap rule (ticket requirement: way to get first ADMIN):
 * If there are no programs yet, allow the first logged-in user to create a program
 * and become its ADMIN (even though they are not ADMIN anywhere yet).
 */
export async function canBootstrapFirstProgram(userId: string): Promise<boolean> {
  const pool = getPool();
  const programsCount = await pool.query<DbCountRow>("select count(*)::text as n from programs");
  const nPrograms = Number(programsCount.rows[0]?.n ?? "0");
  if (nPrograms > 0) return false;

  const memCount = await pool.query<DbCountRow>(
    "select count(*)::text as n from program_memberships where user_id = $1",
    [userId]
  );
  const nMems = Number(memCount.rows[0]?.n ?? "0");
  return nMems === 0;
}

export async function userIsAdminAnywhere(userId: string): Promise<boolean> {
  const pool = getPool();
  const { rows } = await pool.query<{ role: ProgramRole }>(
    "select role from program_memberships where user_id = $1",
    [userId]
  );
  return rows.some((r) => hasAtLeastRole(r.role, "ADMIN"));
}

export async function createProgramAndMakeAdmin(params: {
  userId: string;
  name: string;
  slug: string;
}): Promise<ProgramRow> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("begin");

    const { rows: programRows } = await client.query<ProgramRow>(
      "insert into programs (name, slug) values ($1, $2) returning id, name, slug, created_at",
      [params.name, params.slug]
    );

    const program = programRows[0];
    await client.query(
      "insert into program_memberships (program_id, user_id, role) values ($1, $2, 'ADMIN')",
      [program.id, params.userId]
    );

    await client.query("commit");
    return program;
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

export async function listMemberships(programId: string): Promise<Array<{ user_id: string; email: string; role: ProgramRole }>> {
  const pool = getPool();
  const { rows } = await pool.query<{ user_id: string; email: string; role: ProgramRole }>(
    `
    select m.user_id, u.email, m.role
    from program_memberships m
    join users u on u.id = m.user_id
    where m.program_id = $1
    order by u.email asc
    `,
    [programId]
  );
  return rows;
}

export async function addMembershipByEmail(params: {
  programId: string;
  email: string;
  role: ProgramRole;
}): Promise<void> {
  const pool = getPool();
  const email = params.email.trim().toLowerCase();

  const { rows: userRows } = await pool.query<{ id: string }>(
    "select id from users where email = $1 limit 1",
    [email]
  );
  const userId = userRows[0]?.id;
  if (!userId) {
    const err: any = new Error("USER_NOT_FOUND");
    err.code = "USER_NOT_FOUND";
    throw err;
  }

  await pool.query(
    "insert into program_memberships (program_id, user_id, role) values ($1, $2, $3)",
    [params.programId, userId, params.role]
  );

  // TODO(audit): log membership added
}

export async function updateMembershipRole(params: {
  programId: string;
  userId: string;
  role: ProgramRole;
}): Promise<void> {
  const pool = getPool();
  await pool.query(
    "update program_memberships set role = $3 where program_id = $1 and user_id = $2",
    [params.programId, params.userId, params.role]
  );

  // TODO(audit): log membership role updated
}

export async function removeMembership(params: { programId: string; userId: string }): Promise<void> {
  const pool = getPool();
  await pool.query("delete from program_memberships where program_id = $1 and user_id = $2", [
    params.programId,
    params.userId
  ]);

  // TODO(audit): log membership removed
}
