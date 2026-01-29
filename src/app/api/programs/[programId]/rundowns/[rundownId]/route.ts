import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { requireProgramRole, HttpError } from "@/lib/authorize";
import type { RundownStatus } from "@/lib/rundowns";
import { updateRundownStatus } from "@/lib/rundowns";

export const runtime = "nodejs";

function jsonError(status: number, code: string, message?: string) {
  return NextResponse.json({ error: { code, message: message ?? code } }, { status });
}

function parseStatus(input: any): RundownStatus | null {
  const v = (input ?? "").toString().toUpperCase();
  if (v === "DRAFT" || v === "PROD" || v === "READY" || v === "ARCHIVED") return v;
  return null;
}

export async function PATCH(req: Request, ctx: { params: { programId: string; rundownId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "EDITOR" });

    const body = await req.json().catch(() => ({}));
    const status = parseStatus(body?.status);
    if (!status) return jsonError(400, "VALIDATION_ERROR", "status is required");

    try {
      await updateRundownStatus({ programId: ctx.params.programId, rundownId: ctx.params.rundownId, status });
      return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err: any) {
      if (err?.code === "RUNDOWN_NOT_FOUND") return jsonError(404, "RUNDOWN_NOT_FOUND");
      return jsonError(500, "INTERNAL_ERROR");
    }
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}
