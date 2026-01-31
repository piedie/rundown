# Data Model (Postgres) — v2

## Core
- users (Auth)
- programs
- program_memberships (user_id, program_id, role: VIEWER|EDITOR|ADMIN)

## Rundowns
- rundowns
  - id, program_id
  - title
  - date (date, nullable)
  - start_time (time, nullable)  // voor header zoals screenshot
  - status: DRAFT|PROD|READY|ARCHIVED
  - started_at (timestamptz, nullable) // Run mode light
  - checked (bool, computed/maintained)
  - created_by, created_at, updated_at

## Blocks
- blocks
  - id, rundown_id
  - title
  - order_index
  - kind: NORMAL|BREAK|SEPARATOR (default NORMAL)
  - target_duration_seconds (int, nullable)

## Item types
- item_types
  - id, program_id
  - name
  - color (nullable)
  - icon (nullable)
  - requirements (jsonb, nullable) 
    - voorbeeld: {"needs_script": true, "needs_clip": false, "needs_asset": true}
  - fields_schema (jsonb, nullable)

## Items (grid rows)
- rundown_items
  - id, rundown_id
  - block_id (nullable)
  - order_index
  - lane: PREPARING|READY (default PREPARING)
  - type_id
  - title
  - duration_seconds (int)                 // planned duration (altijd handmatig)
  - actual_duration_seconds (int, nullable) // alleen Run mode light
  - notes (text, nullable)
  - presenter_script (jsonb or text, nullable)
  - scratchpad (jsonb or text, nullable)

  - asset_ready (bool default false)
  - editor_checked (bool default false)

  - assigned_to_user_id (uuid nullable)     // “Ass.” kolom
  - presenter_1 (text nullable)             // “PRES1”
  - presenter_2 (text nullable)             // “PRES2”

  - child_rundown_id (nullable)             // later (sub-rundown)
  - deleted_at (timestamptz nullable)
  - deleted_by (uuid nullable)
  - origin_rundown_item_id (uuid nullable)  // lineage copy/move

  - created_at, updated_at

### Soft delete
- items met deleted_at IS NOT NULL horen niet in normale editor queries.
- prullenbak view per rundown: restore / permanent delete.

## Assets
- assets
  - id, program_id, uploaded_by
  - kind: AUDIO|VIDEO|IMAGE|PDF|OTHER
  - filename, content_type, size_bytes
  - storage_bucket, storage_key
  - duration_seconds (int, nullable)
  - created_at

- item_assets
  - id, item_id, asset_id
  - role: CLIP|BGM|SFX|DOC|OTHER

## Collaboration
- rundown_presence
  - rundown_id, user_id, last_seen_at

- item_locks
  - item_id PK
  - user_id
  - locked_at, expires_at, heartbeat_at

## Audit
- audit_events
  - id, program_id, rundown_id nullable, item_id nullable
  - user_id
  - action (string)
  - payload jsonb
  - created_at
  - app_version (string)

## Computed rules
- rundown.checked = TRUE iff all (non-deleted) rundown_items.editor_checked = TRUE
- block actual duration = sum(planned duration) of items in that block (of rollups later)
- warning if block actual > block target_duration_seconds
- item warning flags (computed in query of in app):
  - missing script if requirements.needs_script && presenter_script empty
  - missing clip if requirements.needs_clip && no item_assets.role=CLIP
  - missing asset if requirements.needs_asset && no item_assets
