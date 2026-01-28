import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function dbPing(): Promise<void> {
  const p = getPool();
  const res = await p.query("select 1 as ok");
  if (!res?.rows?.[0]?.ok) {
    throw new Error("DB ping failed");
  }
}
