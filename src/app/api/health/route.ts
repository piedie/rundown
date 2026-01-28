import { dbPing } from "@/lib/db";

export async function GET() {
  try {
    await dbPing();
    return Response.json({ ok: true, db: "ok" }, { status: 200 });
  } catch (err) {
    return Response.json(
      { ok: false, db: "error", error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
