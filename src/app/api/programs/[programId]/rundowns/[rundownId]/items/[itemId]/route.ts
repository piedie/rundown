import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { requireProgramRole, HttpError } from "@/lib/authorize";
import { deleteItem, updateItem } from "@/lib/editor";

export const runtime = "nodejs";

function jsonError(status: number, code: string, message?: string) {
  return NextResponse.json({ error: { code, message: message ?? code } }, { status });
}

export async function PATCH(req: Request, ctx: { params: { programId: string; rundownId: string; itemId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "EDITOR" });

    const body = await req.json().catch(() => ({}));
    const title = body?.title === undefined ? undefined : (body?.title ?? "").toString().trim();
    const durationSeconds = body?.durationSeconds === undefined ? undefined : Number(body.durationSeconds);
    const presenterScript = body?.presenterScript === undefined ? undefined : (body?.presenterScript ?? "").toString();
    const scratchpad = body?.scratchpad === undefined ? undefined : (body?.scratchpad ?? "").toString();

    await updateItem({
      rundownId: ctx.params.rundownId,
      itemId: ctx.params.itemId,
      title,
      durationSeconds,
      presenterScript,
      scratchpad
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}

export async function DELETE(_req: Request, ctx: { params: { programId: string; rundownId: string; itemId: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    await requireProgramRole({ userId: user.id, programId: ctx.params.programId, minRole: "EDITOR" });

    await deleteItem({ rundownId: ctx.params.rundownId, itemId: ctx.params.itemId });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (e instanceof HttpError) return jsonError(e.status, e.code);
    return jsonError(500, "INTERNAL_ERROR");
  }
}
