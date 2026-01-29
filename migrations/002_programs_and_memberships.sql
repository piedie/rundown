-- Ticket 002: programs + program_memberships

-- Roles constraint via Postgres enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'program_role') THEN
    CREATE TYPE program_role AS ENUM ('VIEWER', 'EDITOR', 'ADMIN');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS programs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS program_memberships (
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       program_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (program_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_program_memberships_user_id
  ON program_memberships(user_id);

CREATE INDEX IF NOT EXISTS idx_program_memberships_program_id
  ON program_memberships(program_id);
