"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProgramRole } from "@/lib/permissions";
import type { BlockRow, ItemTypeRow, RundownItemRow } from "@/lib/editor";

type EditorData = {
  blocks: BlockRow[];
  items: RundownItemRow[];
  itemTypes: ItemTypeRow[];
};

function canEdit(role: ProgramRole): boolean {
  return role === "EDITOR" || role === "ADMIN";
}

function formatDuration(seconds: number | null | undefined): string {
  const s = Math.max(0, seconds ?? 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}

function parseDuration(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  const m = v.match(/^([0-9]{1,3}):([0-5][0-9])$/);
  if (!m) return null;
  const minutes = parseInt(m[1], 10);
  const seconds = parseInt(m[2], 10);
  return minutes * 60 + seconds;
}

function sortByOrder<T extends { order_index: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.order_index - b.order_index);
}

export function RundownEditor(props: {
  programId: string;
  programSlug: string;
  role: ProgramRole;
  rundownId: string;
}) {
  const editable = canEdit(props.role);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [items, setItems] = useState<RundownItemRow[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemTypeRow[]>([]);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) ?? null,
    [items, selectedItemId]
  );

  async function load() {
    setError(null);
    const res = await fetch(
      `/api/programs/${encodeURIComponent(props.programId)}/rundowns/${encodeURIComponent(props.rundownId)}/editor`,
      { method: "GET" }
    );
    const data = (await res.json()) as EditorData;
    if (!res.ok) {
      setError((data as any)?.error?.code ?? "EDITOR_LOAD_FAILED");
      return;
    }
    setBlocks(sortByOrder(data.blocks));
    setItems(sortByOrder(data.items));
    setItemTypes(data.itemTypes);

    // Default selection
    if (!selectedItemId && data.items.length > 0) {
      setSelectedItemId(data.items[0].id);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.programId, props.rundownId]);

  const itemTypeOptions = useMemo(() => {
    const sorted = [...itemTypes].sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [itemTypes]);

  const blocksWithUnassigned = useMemo(() => {
    const b = sortByOrder(blocks);
    return [{
      id: "__unassigned__",
      rundown_id: props.rundownId,
      title: "Losse items",
      order_index: -1,
      target_duration_seconds: null
    } as any as BlockRow, ...b];
  }, [blocks, props.rundownId]);

  const itemsByBlock = useMemo(() => {
    const map = new Map<string, RundownItemRow[]>();
    for (const block of blocksWithUnassigned) {
      map.set(block.id, []);
    }
    for (const it of items) {
      const key = it.block_id ?? "__unassigned__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    for (const [k, v] of map.entries()) {
      map.set(k, sortByOrder(v));
    }
    return map;
  }, [blocksWithUnassigned, items]);

  const flattenedForTotals = useMemo(() => {
    const out: RundownItemRow[] = [];
    for (const block of blocksWithUnassigned) {
      if (block.id === "__unassigned__") continue;
      const list = itemsByBlock.get(block.id) ?? [];
      out.push(...list);
    }
    // Put unassigned at the end
    out.push(...(itemsByBlock.get("__unassigned__") ?? []));
    return out;
  }, [blocksWithUnassigned, itemsByBlock]);

  const totals = useMemo(() => {
    let total = 0;
    const cumeById = new Map<string, number>();
    for (const it of flattenedForTotals) {
      total += it.duration_seconds ?? 0;
      cumeById.set(it.id, total);
    }
    return { total, cumeById };
  }, [flattenedForTotals]);


  const blockTotals = useMemo(() => {
    const map = new Map<
      string,
      { actualSeconds: number; targetSeconds: number | null; deltaSeconds: number | null; isOver: boolean }
    >();

    for (const block of blocksWithUnassigned) {
      const list = itemsByBlock.get(block.id) ?? [];
      const actualSeconds = list.reduce((sum, it) => sum + (it.duration_seconds ?? 0), 0);
      const targetSeconds = block.target_duration_seconds ?? null;
      const deltaSeconds = targetSeconds === null ? null : actualSeconds - targetSeconds;
      const isOver = deltaSeconds !== null && deltaSeconds > 0;
      map.set(block.id, { actualSeconds, targetSeconds, deltaSeconds, isOver });
    }

    return map;
  }, [blocksWithUnassigned, itemsByBlock]);


  async function createBlockUi() {
    if (!editable) return;
    const title = window.prompt("Naam van nieuw blok:", "Blok");
    if (!title) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/programs/${encodeURIComponent(props.programId)}/rundowns/${encodeURIComponent(props.rundownId)}/blocks`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title })
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as any)?.error?.code ?? "BLOCK_CREATE_FAILED");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function renameBlock(blockId: string, currentTitle: string) {
    if (!editable) return;
    const title = window.prompt("Nieuwe bloknaam:", currentTitle);
    if (!title) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/programs/${encodeURIComponent(props.programId)}/rundowns/${encodeURIComponent(props.rundownId)}/blocks/${encodeURIComponent(blockId)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title })
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as any)?.error?.code ?? "BLOCK_UPDATE_FAILED");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }


  async function editBlockTarget(blockId: string, currentTargetSeconds: number | null | undefined) {
    if (!editable) return;

    const current = currentTargetSeconds == null ? "" : formatDuration(currentTargetSeconds);
    const value = window.prompt("Target duration (mm:ss). Leeg = verwijderen:", current);
    if (value === null) return; // cancel

    const parsed = parseDuration(value);
    if (value.trim() !== "" && parsed === null) {
      window.alert("Ongeldig formaat. Gebruik mm:ss (bijv. 10:00).");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/programs/${encodeURIComponent(props.programId)}/rundowns/${encodeURIComponent(props.rundownId)}/blocks/${encodeURIComponent(blockId)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ targetDurationSeconds: parsed })
        }
      );
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error?.code ?? "UPDATE_FAILED");

      // refresh blocks
      const bRes = await fetch(
        `/api/programs/${encodeURIComponent(props.programId)}/rundowns/${encodeURIComponent(props.rundownId)}/blocks`
      );
      const bJson = await bRes.json();
      setBlocks(bJson.blocks ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Kon target niet opslaan");
    } finally {
      setBusy(false);
    }
  }


  async function deleteBlockUi(blockId: string) {
    if (!editable) return;
    if (!window.confirm("Blok verwijderen? Items komen dan in 'Losse items'.")) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/programs/${encodeURIComponent(props.programId)}/rundowns/${encodeURIComponent(props.rundownId)}/blocks/${encodeURIComponent(blockId)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as any)?.error?.code ?? "BLOCK_DELETE_FAILED");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function createItemUi(blockId: string | null) {
    if (!editable) return;
    const title = window.prompt("Titel van nieuw item:", "Item");
    if (!title) return;

    // Always use the first type as dummy.
    const typeId = itemTypeOptions[0]?.id;
    if (!typeId) {
      setError("NO_ITEM_TYPES");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/programs/${encodeURIComponent(props.programId)}/rundowns/${encodeURIComponent(props.rundownId)}/items`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, blockId, typeId })
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as any)?.error?.code ?? "ITEM_CREATE_FAILED");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function deleteItemUi(itemId: string) {
    if (!editable) return;
    if (!window.confirm("Item verwijderen?")) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/programs/${encodeURIComponent(props.programId)}/rundowns/${encodeURIComponent(props.rundownId)}/items/${encodeURIComponent(itemId)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as any)?.error?.code ?? "ITEM_DELETE_FAILED");
        return;
      }
      if (selectedItemId === itemId) setSelectedItemId(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function patchItem(itemId: string, patch: Partial<RundownItemRow>) {
    if (!editable) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/programs/${encodeURIComponent(props.programId)}/rundowns/${encodeURIComponent(props.rundownId)}/items/${encodeURIComponent(itemId)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(patch)
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as any)?.error?.code ?? "ITEM_UPDATE_FAILED");
        return;
      }
      // Optimistically update local copy so typing feels snappy.
      setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...patch } : it)));
    } finally {
      setBusy(false);
    }
  }

  // --- Drag and drop ---

  const [dragItemId, setDragItemId] = useState<string | null>(null);

  function onDragStartItem(itemId: string) {
    if (!editable) return;
    setDragItemId(itemId);
  }

  function onDragEndItem() {
    setDragItemId(null);
  }

  function moveItemLocal(itemId: string, targetBlockId: string | null, targetIndex: number) {
    setItems((prev) => {
      const current = [...prev];
      const idx = current.findIndex((i) => i.id === itemId);
      if (idx === -1) return prev;
      const moving = { ...current[idx], block_id: targetBlockId };
      current.splice(idx, 1);

      const siblings = current
        .filter((i) => (i.block_id ?? null) === (targetBlockId ?? null))
        .sort((a, b) => a.order_index - b.order_index);

      // Find insertion point in full array: insert before the sibling at targetIndex.
      const before = siblings[targetIndex] ?? null;
      if (!before) {
        current.push(moving);
      } else {
        const beforeIdx = current.findIndex((i) => i.id === before.id);
        current.splice(beforeIdx, 0, moving);
      }

      // Renumber order_index per block.
      const byBlock = new Map<string, RundownItemRow[]>();
      for (const it of current) {
        const key = it.block_id ?? "__unassigned__";
        if (!byBlock.has(key)) byBlock.set(key, []);
        byBlock.get(key)!.push(it);
      }
      const out = current.map((it) => ({ ...it }));
      const idToOrder = new Map<string, number>();
      for (const [key, list] of byBlock.entries()) {
        const ordered = list.sort((a, b) => a.order_index - b.order_index);
        ordered.forEach((it, i) => idToOrder.set(it.id, i + 1));
      }
      for (const it of out) {
        it.order_index = idToOrder.get(it.id) ?? it.order_index;
      }
      return out;
    });
  }

  async function persistReorder() {
    if (!editable) return;

    const payload = {
      blocks: sortByOrder(blocks).map((b, i) => ({ id: b.id, order_index: i + 1 })),
      items: items.map((it) => ({ id: it.id, block_id: it.block_id, order_index: it.order_index }))
    };

    const res = await fetch(
      `/api/programs/${encodeURIComponent(props.programId)}/rundowns/${encodeURIComponent(props.rundownId)}/reorder`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((data as any)?.error?.code ?? "REORDER_FAILED");
      await load();
    }
  }

  // Handle drop on a block container (append at end)
  function onDropOnBlock(blockId: string | null) {
    if (!editable) return;
    if (!dragItemId) return;

    const targetKey = blockId ?? null;
    const currentList = items.filter((i) => (i.block_id ?? null) === (targetKey ?? null)).sort((a, b) => a.order_index - b.order_index);
    const targetIndex = currentList.length;

    moveItemLocal(dragItemId, targetKey, targetIndex);
    void persistReorder();
    setDragItemId(null);
  }

  function onDropBeforeItem(targetItem: RundownItemRow) {
    if (!editable) return;
    if (!dragItemId) return;

    const targetBlockId = targetItem.block_id ?? null;
    const list = items
      .filter((i) => (i.block_id ?? null) === (targetBlockId ?? null))
      .sort((a, b) => a.order_index - b.order_index);

    const targetIndex = list.findIndex((i) => i.id === targetItem.id);
    moveItemLocal(dragItemId, targetBlockId, Math.max(0, targetIndex));
    void persistReorder();
    setDragItemId(null);
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4">
          <div className="text-sm text-zinc-700">
            Totale duur: <span className="font-mono">{formatDuration(totals.total)}</span>
            {busy ? <span className="ml-2 text-zinc-500">(bezig...)</span> : null}
          </div>
          <div className="flex items-center gap-2">
            {editable ? (
              <button
                type="button"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                onClick={createBlockUi}
                disabled={busy}
              >
                + Blok
              </button>
            ) : null}
          </div>
        </div>

        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        <div className="space-y-3">
          {blocksWithUnassigned.map((block) => {
            const isUnassigned = block.id === "__unassigned__";
            const blockItems = itemsByBlock.get(block.id) ?? [];
            const bt = blockTotals.get(block.id);

            return (
              <div
                key={block.id}
                className="rounded-lg border border-zinc-200"
                onDragOver={(e) => {
                  if (!editable) return;
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  onDropOnBlock(isUnassigned ? null : block.id);
                }}
              >
                <div
                  className={[
                    "flex items-center justify-between gap-2 border-b p-3",
                    bt?.isOver ? "border-red-200 bg-red-50" : "border-zinc-200"
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <div className="font-medium">{block.title}</div>

                    {!isUnassigned ? (
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-700">
                        <span>
                          Target:{" "}
                          <span className="font-medium">
                            {bt?.targetSeconds == null ? "—" : formatDuration(bt.targetSeconds)}
                          </span>
                        </span>
                        <span>
                          Actual:{" "}
                          <span className="font-medium">{formatDuration(bt?.actualSeconds ?? 0)}</span>
                        </span>
                        <span>
                          +/-:{" "}
                          <span className={bt?.isOver ? "font-medium text-red-700" : "font-medium"}>
                            {bt?.deltaSeconds == null ? "—" : (bt.deltaSeconds > 0 ? "+" : "") + formatDuration(Math.abs(bt.deltaSeconds))}
                          </span>
                        </span>
                        {bt?.isOver ? <span className="rounded bg-red-600 px-2 py-0.5 text-white">Overrun</span> : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    {editable ? (
                      <>
                        <button
                          type="button"
                          className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                          onClick={() => createItemUi(isUnassigned ? null : block.id)}
                          disabled={busy}
                        >
                          + Item
                        </button>
                        {!isUnassigned ? (
                          <>
                            <button
                              type="button"
                              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                              onClick={() => renameBlock(block.id, block.title)}
                              disabled={busy}
                            >
                              Naam
                            </button>
                            <button
                              type="button"
                              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                              onClick={() => deleteBlockUi(block.id)}
                              disabled={busy}
                            >
                              Verwijder
                            </button>
                          </>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="divide-y divide-zinc-100">
                  {blockItems.length === 0 ? (
                    <div className="p-3 text-sm text-zinc-600">(geen items)</div>
                  ) : (
                    blockItems.map((it) => {
                      const isSelected = it.id === selectedItemId;
                      const cume = totals.cumeById.get(it.id) ?? 0;

                      return (
                        <div
                          key={it.id}
                          draggable={editable}
                          onDragStart={() => onDragStartItem(it.id)}
                          onDragEnd={onDragEndItem}
                          onDragOver={(e) => {
                            if (!editable) return;
                            e.preventDefault();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            onDropBeforeItem(it);
                          }}
                          className={
                            "flex items-center justify-between gap-3 p-3 " +
                            (isSelected ? "bg-zinc-50" : "bg-white")
                          }
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedItemId(it.id)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <span className="w-5 text-zinc-400">≡</span>
                            <span className="truncate">{it.title}</span>
                          </button>

                          <div className="flex shrink-0 items-center gap-3 text-sm text-zinc-700">
                            <span className="font-mono">{formatDuration(it.duration_seconds)}</span>
                            <span className="font-mono text-zinc-500">cume {formatDuration(cume)}</span>
                            {editable ? (
                              <button
                                type="button"
                                className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                                onClick={() => deleteItemUi(it.id)}
                                disabled={busy}
                              >
                                Verwijder
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 p-4">
        <h2 className="text-lg font-semibold">Item details</h2>

        {!selectedItem ? (
          <div className="mt-4 text-sm text-zinc-600">Selecteer een item.</div>
        ) : (
          <div className="mt-4 grid gap-4">
            <div className="grid gap-1">
              <label className="text-sm text-zinc-700">Titel</label>
              <input
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                value={selectedItem.title}
                onChange={(e) => patchItem(selectedItem.id, { title: e.target.value })}
                disabled={!editable || busy}
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm text-zinc-700">Type</label>
              <select
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                value={selectedItem.type_id}
                onChange={(e) => patchItem(selectedItem.id, { type_id: e.target.value })}
                disabled={!editable || busy}
              >
                {itemTypeOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <label className="text-sm text-zinc-700">Duur (mm:ss)</label>
              <input
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-mono"
                value={formatDuration(selectedItem.duration_seconds)}
                onChange={(e) => {
                  const seconds = parseDuration(e.target.value);
                  if (seconds === null) return;
                  patchItem(selectedItem.id, { duration_seconds: seconds });
                }}
                disabled={!editable || busy}
              />
              <div className="text-xs text-zinc-500">Tip: bijvoorbeeld 00:30 of 12:05</div>
            </div>

            <div className="grid gap-1">
              <label className="text-sm text-zinc-700">Script</label>
              <textarea
                className="min-h-[140px] rounded-md border border-zinc-300 px-3 py-2 text-sm"
                value={selectedItem.script}
                onChange={(e) => patchItem(selectedItem.id, { script: e.target.value })}
                disabled={!editable || busy}
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm text-zinc-700">Kladblok</label>
              <textarea
                className="min-h-[140px] rounded-md border border-zinc-300 px-3 py-2 text-sm"
                value={selectedItem.scratchpad}
                onChange={(e) => patchItem(selectedItem.id, { scratchpad: e.target.value })}
                disabled={!editable || busy}
              />
            </div>

            {!editable ? (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
                Je hebt <span className="font-mono">VIEWER</span>-rechten: je kunt niet wijzigen.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
