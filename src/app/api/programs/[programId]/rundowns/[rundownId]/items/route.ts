import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { requireProgramRole, HttpError } from "@/lib/authorize";
import { createItem, getEditorData } from "@/lib/editor";

export const runtime = "nodejs";

function jsonError(status: number, code: string, message?: string) {
  return NextResponse.json({ error: { code, message: message ?? code } }, { status });
}

export async function GET(_req: Request, ctx: { params: { programId: string; rundownId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "VIEWER" });

    const data = await getEditorData({ programId: ctx.params.programId, rundownId: ctx.params.rundownId });
    return NextResponse.json({ items: data.items });
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
    const blockId = body?.blockId ? body.blockId.toString() : null;

    if (!title) return jsonError(400, "VALIDATION_ERROR", "title is required");

    // Use first available item type ("Dummy")
    const data = await getEditorData({ programId: ctx.params.programId, rundownId: ctx.params.rundownId });
    const typeId = data.itemTypes[0]?.id;
    if (!typeId) return jsonError(500, "NO_ITEM_TYPES", "No item types exist for this program");

    const item = await createItem({ rundownId: ctx.params.rundownId, blockId, title, typeId, durationSeconds: 0 });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}
