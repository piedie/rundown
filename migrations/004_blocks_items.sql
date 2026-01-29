-- Ticket 004 — blocks + items + dummy item types

BEGIN;

-- Blocks
CREATE TABLE IF NOT EXISTS blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rundown_id uuid NOT NULL REFERENCES rundowns(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index int NOT NULL,
  target_duration_seconds int NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocks_rundown_order ON blocks(rundown_id, order_index);

-- Item types (minimal, "dummy" for now)
CREATE TABLE IF NOT EXISTS item_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  fields_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  color text NULL,
  icon text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_item_types_program_name ON item_types(program_id, name);

-- Ensure each existing program has a "Dummy" type.
INSERT INTO item_types (program_id, name)
SELECT p.id, 'Dummy'
FROM programs p
WHERE NOT EXISTS (
  SELECT 1 FROM item_types it WHERE it.program_id = p.id
);

-- Rundown items (minimal subset)
CREATE TABLE IF NOT EXISTS rundown_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rundown_id uuid NOT NULL REFERENCES rundowns(id) ON DELETE CASCADE,
  block_id uuid NULL REFERENCES blocks(id) ON DELETE SET NULL,
  order_index int NOT NULL,
  type_id uuid NOT NULL REFERENCES item_types(id),
  title text NOT NULL,
  duration_seconds int NOT NULL DEFAULT 0,
  presenter_script text NOT NULL DEFAULT '',
  scratchpad text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rundown_items_rundown_block_order ON rundown_items(rundown_id, block_id, order_index);

COMMIT;
