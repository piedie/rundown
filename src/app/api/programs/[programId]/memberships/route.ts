import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { addMembershipByEmail, listMemberships } from "@/lib/programs";
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

export async function GET(_req: Request, ctx: { params: { programId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "ADMIN" });

    const memberships = await listMemberships(ctx.params.programId);
    return NextResponse.json({ memberships });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}

export async function POST(req: Request, ctx: { params: { programId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "ADMIN" });

    const body = await req.json().catch(() => ({}));
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const role = parseRole(body?.role);

    if (!email || !role) return jsonError(400, "VALIDATION_ERROR", "email and role are required");

    try {
      await addMembershipByEmail({ programId: ctx.params.programId, email, role });
      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (err: any) {
      if (err?.code === "USER_NOT_FOUND") return jsonError(404, "USER_NOT_FOUND");
      if (err?.code === "23505") return jsonError(409, "ALREADY_MEMBER");
      return jsonError(500, "INTERNAL_ERROR");
    }
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}
