import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { requireProgramRole, HttpError } from "@/lib/authorize";
import { reorderAll } from "@/lib/editor";

export const runtime = "nodejs";

function jsonError(status: number, code: string, message?: string) {
  return NextResponse.json({ error: { code, message: message ?? code } }, { status });
}

export async function POST(req: Request, ctx: { params: { programId: string; rundownId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "EDITOR" });

    const body = await req.json().catch(() => ({}));
    const blockOrder = Array.isArray(body?.blockOrder) ? body.blockOrder.map(String) : [];
    const items = Array.isArray(body?.items)
      ? body.items
          .map((it: any) => ({
            id: String(it.id),
            blockId: it.blockId === null || it.blockId === undefined ? null : String(it.blockId),
            orderIndex: Number(it.orderIndex)
          }))
          .filter((it: any) => it.id && Number.isFinite(it.orderIndex))
      : [];

    if (!blockOrder.length) return jsonError(400, "VALIDATION_ERROR", "blockOrder is required");

    await reorderAll({ rundownId: ctx.params.rundownId, blockOrder, items });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}
