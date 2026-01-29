import { getPool } from "@/lib/db";

export type RundownStatus = "DRAFT" | "PROD" | "READY" | "ARCHIVED";

export type RundownRow = {
  id: string;
  program_id: string;
  title: string;
  date: string | null; // ISO date (YYYY-MM-DD)
  status: RundownStatus;
  checked: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export async function listRundowns(programId: string): Promise<RundownRow[]> {
  const pool = getPool();
  const { rows } = await pool.query<RundownRow>(
    `
    select id, program_id, title, date::text as date, status, checked, created_by, created_at, updated_at
    from rundowns
    where program_id = $1
    order by
      (date is null) asc,
      date desc nulls last,
      created_at desc
    `,
    [programId]
  );
  return rows;
}

export async function createRundown(params: {
  programId: string;
  title: string;
  date: string | null;
  createdBy: string;
}): Promise<RundownRow> {
  const pool = getPool();
  const { rows } = await pool.query<RundownRow>(
    `
    insert into rundowns (program_id, title, date, status, checked, created_by)
    values ($1, $2, $3, 'DRAFT', false, $4)
    returning id, program_id, title, date::text as date, status, checked, created_by, created_at, updated_at
    `,
    [params.programId, params.title, params.date, params.createdBy]
  );
  return rows[0];
}

export async function copyRundown(params: {
  programId: string;
  sourceRundownId: string;
  newTitle: string;
  newDate: string | null;
  createdBy: string;
}): Promise<RundownRow> {
  const pool = getPool();

  // We only copy the "rundown header" for now.
  // Items/blocks/checks are explicitly out of scope for Ticket 003.
  const { rows } = await pool.query<RundownRow>(
    `
    insert into rundowns (program_id, title, date, status, checked, created_by)
    select $1, $2, $3, 'DRAFT', false, $4
    from rundowns
    where id = $5 and program_id = $1
    returning id, program_id, title, date::text as date, status, checked, created_by, created_at, updated_at
    `,
    [params.programId, params.newTitle, params.newDate, params.createdBy, params.sourceRundownId]
  );

  const created = rows[0];
  if (!created) {
    const err: any = new Error("RUNDOWN_NOT_FOUND");
    err.code = "RUNDOWN_NOT_FOUND";
    throw err;
  }
  return created;
}

export async function updateRundownStatus(params: {
  programId: string;
  rundownId: string;
  status: RundownStatus;
}): Promise<void> {
  const pool = getPool();
  const res = await pool.query(
    `
    update rundowns
    set status = $3, updated_at = now()
    where id = $2 and program_id = $1
    `,
    [params.programId, params.rundownId, params.status]
  );
  if (res.rowCount === 0) {
    const err: any = new Error("RUNDOWN_NOT_FOUND");
    err.code = "RUNDOWN_NOT_FOUND";
    throw err;
  }

  // TODO(audit): log status change
}
