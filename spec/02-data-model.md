# Data Model (Postgres)

## Core tables
- users (Auth.js)
- programs
- program_memberships (user_id, program_id, role: VIEWER|EDITOR|ADMIN)

- rundowns
  - id, program_id, title, date(optional), status: DRAFT|PROD|READY|ARCHIVED
  - checked (bool, computed/maintained)
  - created_by, created_at, updated_at

- blocks
  - id, rundown_id, title, order_index
  - target_duration_seconds (int, nullable)

- item_types
  - id, program_id, name, color(optional), icon(optional), fields_schema (json)
  - allow_admin_manage: only ADMIN can edit types
  - item_types zijn per programma gedefinieerd
- een programma kan zijn eigen itemtypes hebben
- itemtypes worden niet gedeeld tussen programma’s


- rundown_items
  - id, rundown_id, block_id nullable
  - order_index (float or int with reorder strategy)
  - type_id
  - title
  - duration_seconds (int)
  - notes (text)
  - script_rich (json or html)
  - ready (bool)
  - checked_by_editor (bool)
  - child_rundown_id nullable (for sub-rundown)
  - created_at, updated_at
  - presenter_script (rich text / json)
  - scratchpad (rich text / json of plain text)
  - deleted_at (timestamp nullable)
  - deleted_by (user_id nullable)
  - origin_rundown_item_id (nullable, voor “doorzetten/kopie” lineage)
  - items met deleted_at IS NOT NULL horen niet in normale editor query’s.

## Assets
- assets
  - id, program_id, uploaded_by
  - kind: AUDIO|VIDEO|IMAGE|PDF|OTHER
  - filename, content_type, size_bytes
  - storage_bucket, storage_key
  - duration_seconds nullable (can be filled later)
  - created_at

- item_assets (many-to-many, or 1-to-many)
  - id, item_id, asset_id
  - role: CLIP|BGM|SFX|OTHER

## Audio expansion (later)
- asset_waveforms
  - asset_id PK
  - peaks json (compressed list) OR pointer to file
  - sample_rate, channels

- asset_cuepoints
  - id, asset_id
  - label, time_seconds
  - fade_in_ms nullable, fade_out_ms nullable

## Collaboration
- rundown_presence
  - rundown_id, user_id, last_seen_at

- item_locks
  - item_id PK
  - user_id
  - locked_at, expires_at
  - heartbeat_at

## Audit
- audit_events
  - id, program_id, rundown_id nullable, item_id nullable
  - user_id, action (string), payload json
  - created_at
  - app_version (string)


## Computed rules
- rundown.checked = TRUE iff all rundown_items.checked_by_editor = TRUE
- block actual duration = sum(item.duration_seconds or rollup child)
- warning if block actual > block target_duration_seconds
