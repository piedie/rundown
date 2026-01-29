import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { canBootstrapFirstProgram, createProgramAndMakeAdmin, listProgramsForUser, userIsAdminAnywhere } from "@/lib/programs";

export const runtime = "nodejs";

function jsonError(status: number, code: string, message?: string) {
  return NextResponse.json({ error: { code, message: message ?? code } }, { status });
}

export async function GET() {
  try {
    const user = await getCurrentUserOrThrow();
    const programs = await listProgramsForUser(user.id);
    return NextResponse.json({ programs });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    return jsonError(500, "INTERNAL_ERROR");
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUserOrThrow();
    const body = await req.json().catch(() => ({}));
    const name = (body?.name ?? "").toString().trim();
    const slug = (body?.slug ?? "").toString().trim().toLowerCase();

    if (!name || !slug) return jsonError(400, "VALIDATION_ERROR", "name and slug are required");

    // Authorization: ADMIN anywhere OR bootstrap first program.
    const bootstrapOk = await canBootstrapFirstProgram(user.id);
    const adminAnywhere = await userIsAdminAnywhere(user.id);
    if (!bootstrapOk && !adminAnywhere) return jsonError(403, "FORBIDDEN");

    try {
      const program = await createProgramAndMakeAdmin({ userId: user.id, name, slug });
      return NextResponse.json({ program }, { status: 201 });
    } catch (err: any) {
      // unique violation
      if (err?.code === "23505") return jsonError(409, "SLUG_ALREADY_EXISTS");
      return jsonError(500, "INTERNAL_ERROR");
    }
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    return jsonError(500, "INTERNAL_ERROR");
  }
}
