# API + Realtime — v2

## REST/HTTP (voorbeeld routes)
- GET /api/programs
- GET /api/programs/:id/rundowns
- POST /api/rundowns
- POST /api/rundowns/:id/copy
- PATCH /api/rundowns/:id (title/date/start_time/status)
- POST /api/rundowns/:id/start   // sets started_at if null
- GET /api/rundowns/:id (incl blocks + items + computed totals)

Blocks
- POST /api/rundowns/:id/blocks
- PATCH /api/blocks/:id

Items
- POST /api/rundowns/:id/items
- PATCH /api/items/:id
- POST /api/items/:id/reorder
- POST /api/items/:id/move-lane  {lane: READY|PREPARING}
- POST /api/items/:id/lock
- POST /api/items/:id/unlock
- GET  /api/rundowns/:id/trash
- POST /api/items/:id/restore
- DELETE /api/items/:id/permanent (ADMIN)

Assets
- POST /api/assets/upload (returns presigned PUT URL)
- POST /api/items/:id/assets/attach
- DELETE /api/item-assets/:id

## WebSocket events (server -> client)
- presence:update {rundownId, users[]}
- lock:update {itemId, lockedBy, expiresAt}
- item:updated {itemId, patch}
- block:updated {blockId, patch}
- item:reordered {rundownId}
- audit:new {event}

## WebSocket client -> server
- presence:heartbeat {rundownId}
- lock:acquire {itemId}
- lock:heartbeat {itemId}
- lock:release {itemId}

TTL strategy
- lock expires after 60s unless heartbeat
- presence expires after 30s unless heartbeat

Audit (minimum actions)
- ITEM_UPDATED
- ITEM_REORDERED
- ITEM_LANE_CHANGED
- BLOCK_UPDATED
- ASSET_UPLOADED
- ITEM_ASSET_ATTACHED
- ITEM_EDITOR_CHECKED_TOGGLED
- ITEM_ASSET_READY_TOGGLED
- RUNDOWN_STARTED
- RUNDOWN_STATUS_CHANGED
