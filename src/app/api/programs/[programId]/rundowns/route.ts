import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { requireProgramRole, HttpError } from "@/lib/authorize";
import { createRundown, listRundowns } from "@/lib/rundowns";

export const runtime = "nodejs";

function jsonError(status: number, code: string, message?: string) {
  return NextResponse.json({ error: { code, message: message ?? code } }, { status });
}

export async function GET(_req: Request, ctx: { params: { programId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "VIEWER" });

    const rundowns = await listRundowns(ctx.params.programId);
    return NextResponse.json({ rundowns });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}

export async function POST(req: Request, ctx: { params: { programId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "EDITOR" });

    const body = await req.json().catch(() => ({}));
    const title = (body?.title ?? "").toString().trim();
    const dateRaw = (body?.date ?? "").toString().trim();
    const date = dateRaw ? dateRaw : null;

    if (!title) return jsonError(400, "VALIDATION_ERROR", "title is required");

    const rundown = await createRundown({ programId: ctx.params.programId, title, date, createdBy: user.id });
    return NextResponse.json({ rundown }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}
