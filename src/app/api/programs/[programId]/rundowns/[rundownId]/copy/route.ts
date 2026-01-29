import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { requireProgramRole, HttpError } from "@/lib/authorize";
import { copyRundown } from "@/lib/rundowns";

export const runtime = "nodejs";

function jsonError(status: number, code: string, message?: string) {
  return NextResponse.json({ error: { code, message: message ?? code } }, { status });
}

export async function POST(req: Request, ctx: { params: { programId: string; rundownId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "EDITOR" });

    const body = await req.json().catch(() => ({}));
    const title = (body?.title ?? "").toString().trim();
    const dateRaw = (body?.date ?? "").toString().trim();
    const date = dateRaw ? dateRaw : null;

    if (!title) return jsonError(400, "VALIDATION_ERROR", "title is required");

    try {
      const rundown = await copyRundown({
        programId: ctx.params.programId,
        sourceRundownId: ctx.params.rundownId,
        newTitle: title,
        newDate: date,
        createdBy: user.id
      });
      return NextResponse.json({ rundown }, { status: 201 });
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
