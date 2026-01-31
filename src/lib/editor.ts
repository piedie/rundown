import { getPool } from "@/lib/db";

export type BlockRow = {
  id: string;
  rundown_id: string;
  title: string;
  order_index: number;
  target_duration_seconds: number | null;
};

export type ItemTypeRow = {
  id: string;
  program_id: string;
  name: string;
};

export type RundownItemRow = {
  id: string;
  rundown_id: string;
  block_id: string | null;
  order_index: number;
  type_id: string;
  title: string;
  duration_seconds: number;
  presenter_script: string;
  scratchpad: string;
};

export type EditorData = {
  blocks: BlockRow[];
  items: RundownItemRow[];
  itemTypes: ItemTypeRow[];
};

export async function getRundownProgramId(rundownId: string): Promise<string | null> {
  const pool = getPool();
  const { rows } = await pool.query<{ program_id: string }>(
    "select program_id from rundowns where id = $1",
    [rundownId]
  );
  return rows[0]?.program_id ?? null;
}

export async function getEditorData(params: { programId: string; rundownId: string }): Promise<EditorData> {
  const pool = getPool();

  const blocksRes = await pool.query<BlockRow>(
    `
    select id, rundown_id, title, order_index, target_duration_seconds
    from blocks
    where rundown_id = $1
    order by order_index asc
    `,
    [params.rundownId]
  );

  const itemsRes = await pool.query<RundownItemRow>(
    `
    select id, rundown_id, block_id, order_index, type_id, title, duration_seconds, presenter_script, scratchpad
    from rundown_items
    where rundown_id = $1
    order by block_id nulls first, order_index asc
    `,
    [params.rundownId]
  );

  const typesRes = await pool.query<ItemTypeRow>(
    `
    select id, program_id, name
    from item_types
    where program_id = $1
    order by name asc
    `,
    [params.programId]
  );

  return {
    blocks: blocksRes.rows,
    items: itemsRes.rows,
    itemTypes: typesRes.rows
  };
}

export async function createBlock(params: {
  rundownId: string;
  title: string;
  targetDurationSeconds?: number | null;
}): Promise<BlockRow> {
  const pool = getPool();
  const nextOrderRes = await pool.query<{ next: number }>(
    "select coalesce(max(order_index), 0) + 1 as next from blocks where rundown_id = $1",
    [params.rundownId]
  );
  const orderIndex = nextOrderRes.rows[0]?.next ?? 1;

  const { rows } = await pool.query<BlockRow>(
    `
    insert into blocks (rundown_id, title, order_index, target_duration_seconds)
    values ($1, $2, $3, $4)
    returning id, rundown_id, title, order_index, target_duration_seconds
    `,
    [params.rundownId, params.title, orderIndex, params.targetDurationSeconds ?? null]
  );
  return rows[0];
}

export async function updateBlock(params: {
  rundownId: string;
  blockId: string;
  title?: string;
  targetDurationSeconds?: number | null;
}): Promise<void> {
  const pool = getPool();

  // title: undefined = don't change, otherwise set (can be empty string if caller wants)
  const title = params.title ?? null;

  // target: undefined = don't change, null = clear, number = set
  const hasTarget = params.targetDurationSeconds !== undefined;
  const target = params.targetDurationSeconds ?? null;

  await pool.query(
    `
    update blocks
    set
      title = coalesce($3, title),
      target_duration_seconds = case when $4::bool then $5::int else target_duration_seconds end,
      updated_at = now()
    where id = $2 and rundown_id = $1
    `,
    [params.rundownId, params.blockId, title, hasTarget, target]
  );

  // TODO(audit): log block changes
}


export async function deleteBlock(params: { rundownId: string; blockId: string }): Promise<void> {
  const pool = getPool();
  await pool.query(
    "update rundown_items set block_id = null where rundown_id = $1 and block_id = $2",
    [params.rundownId, params.blockId]
  );
  await pool.query("delete from blocks where rundown_id = $1 and id = $2", [params.rundownId, params.blockId]);
  // TODO(audit): log block delete
}

export async function createItem(params: {
  rundownId: string;
  blockId: string | null;
  title: string;
  typeId: string;
  durationSeconds?: number;
}): Promise<RundownItemRow> {
  const pool = getPool();
  const nextOrderRes = await pool.query<{ next: number }>(
    "select coalesce(max(order_index), 0) + 1 as next from rundown_items where rundown_id = $1 and block_id is not distinct from $2",
    [params.rundownId, params.blockId]
  );
  const orderIndex = nextOrderRes.rows[0]?.next ?? 1;

  const { rows } = await pool.query<RundownItemRow>(
    `
    insert into rundown_items (rundown_id, block_id, order_index, type_id, title, duration_seconds)
    values ($1, $2, $3, $4, $5, $6)
    returning id, rundown_id, block_id, order_index, type_id, title, duration_seconds, presenter_script, scratchpad
    `,
    [params.rundownId, params.blockId, orderIndex, params.typeId, params.title, params.durationSeconds ?? 0]
  );

  return rows[0];
}

export async function updateItem(params: {
  rundownId: string;
  itemId: string;
  title?: string;
  typeId?: string;
  durationSeconds?: number;
  presenterScript?: string;
  scratchpad?: string;
}): Promise<void> {
  const pool = getPool();
  await pool.query(
    `
    update rundown_items
    set
      title = coalesce($3, title),
      type_id = coalesce($4, type_id),
      duration_seconds = coalesce($5, duration_seconds),
      presenter_script = coalesce($6, presenter_script),
      scratchpad = coalesce($7, scratchpad),
      updated_at = now()
    where rundown_id = $1 and id = $2
    `,
    [
      params.rundownId,
      params.itemId,
      params.title ?? null,
      params.typeId ?? null,
      params.durationSeconds ?? null,
      params.presenterScript ?? null,
      params.scratchpad ?? null
    ]
  );
  // TODO(audit): log item changes
}

export async function deleteItem(params: { rundownId: string; itemId: string }): Promise<void> {
  const pool = getPool();
  await pool.query("delete from rundown_items where rundown_id = $1 and id = $2", [params.rundownId, params.itemId]);
  // TODO(audit): log item delete
}

export async function reorderAll(params: {
  rundownId: string;
  blockOrder: string[];
  items: Array<{ id: string; blockId: string | null; orderIndex: number }>;
}): Promise<void> {
  const pool = getPool();

  await pool.query("BEGIN");
  try {
    for (let i = 0; i < params.blockOrder.length; i++) {
      await pool.query(
        "update blocks set order_index = $3, updated_at = now() where rundown_id = $1 and id = $2",
        [params.rundownId, params.blockOrder[i], i + 1]
      );
    }

    for (const item of params.items) {
      await pool.query(
        "update rundown_items set block_id = $3, order_index = $4, updated_at = now() where rundown_id = $1 and id = $2",
        [params.rundownId, item.id, item.blockId, item.orderIndex]
      );
    }

    await pool.query("COMMIT");
  } catch (e) {
    await pool.query("ROLLBACK");
    throw e;
  }

  // TODO(audit): log reorder
}
