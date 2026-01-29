import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { requireProgramRole, HttpError } from "@/lib/authorize";
import { createBlock, getEditorData } from "@/lib/editor";

export const runtime = "nodejs";

function jsonError(status: number, code: string, message?: string) {
  return NextResponse.json({ error: { code, message: message ?? code } }, { status });
}

export async function GET(_req: Request, ctx: { params: { programId: string; rundownId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "VIEWER" });

    const data = await getEditorData({ programId: ctx.params.programId, rundownId: ctx.params.rundownId });
    return NextResponse.json({ blocks: data.blocks });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}

export async function POST(req: Request, ctx: { params: { programId: string; rundownId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "EDITOR" });

    const body = await req.json().catch(() => ({}));
    const title = (body?.title ?? "").toString().trim();
    if (!title) return jsonError(400, "VALIDATION_ERROR", "title is required");

    const block = await createBlock({ rundownId: ctx.params.rundownId, title, targetDurationSeconds: null });
    return NextResponse.json({ block }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}
