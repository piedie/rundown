-- Ticket 003: rundowns

-- Status constraint via Postgres enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rundown_status') THEN
    CREATE TYPE rundown_status AS ENUM ('DRAFT', 'PROD', 'READY', 'ARCHIVED');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS rundowns (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  date       DATE NULL,
  status     rundown_status NOT NULL DEFAULT 'DRAFT',
  checked    BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rundowns_program_id
  ON rundowns(program_id);

CREATE INDEX IF NOT EXISTS idx_rundowns_program_id_date
  ON rundowns(program_id, date);
