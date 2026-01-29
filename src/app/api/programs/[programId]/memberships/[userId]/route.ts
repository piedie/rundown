import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { removeMembership, updateMembershipRole } from "@/lib/programs";
import { requireProgramRole, HttpError } from "@/lib/authorize";
import type { ProgramRole } from "@/lib/permissions";

export const runtime = "nodejs";

function jsonError(status: number, code: string, message?: string) {
  return NextResponse.json({ error: { code, message: message ?? code } }, { status });
}

function parseRole(input: any): ProgramRole | null {
  const v = (input ?? "").toString().toUpperCase();
  if (v === "VIEWER" || v === "EDITOR" || v === "ADMIN") return v;
  return null;
}

export async function PATCH(req: Request, ctx: { params: { programId: string; userId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "ADMIN" });

    const body = await req.json().catch(() => ({}));
    const role = parseRole(body?.role);
    if (!role) return jsonError(400, "VALIDATION_ERROR", "role is required");

    await updateMembershipRole({ programId: ctx.params.programId, userId: ctx.params.userId, role });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}

export async function DELETE(_req: Request, ctx: { params: { programId: string; userId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "ADMIN" });

    await removeMembership({ programId: ctx.params.programId, userId: ctx.params.userId });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}
