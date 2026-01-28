# API + Realtime

## REST/HTTP (examples)
- GET /api/programs
- GET /api/programs/:id/rundowns
- POST /api/rundowns
- POST /api/rundowns/:id/copy
- PATCH /api/rundowns/:id (status/title)
- GET /api/rundowns/:id
- POST /api/rundowns/:id/blocks
- POST /api/rundowns/:id/items
- PATCH /api/items/:id
- POST /api/items/:id/reorder
- POST /api/items/:id/lock
- POST /api/items/:id/unlock
- POST /api/assets/upload (returns presigned PUT URL)
- POST /api/items/:id/assets/attach

## WebSocket events (server -> client)
- presence:update {rundownId, users[]}
- lock:update {itemId, lockedBy, expiresAt}
- item:updated {itemId, patch}
- audit:new {event}

## WebSocket client -> server
- presence:heartbeat {rundownId}
- lock:acquire {itemId}
- lock:heartbeat {itemId}
- lock:release {itemId}

TTL strategy:
- lock expires after 60s unless heartbeats refresh
- presence expires after 30s unless heartbeat

Audit events:
- ITEM_UPDATED
- ITEM_REORDERED
- BLOCK_UPDATED
- ASSET_UPLOADED
- ITEM_CHECKED_TOGGLED
- ITEM_READY_TOGGLED
- RUNDOWN_STATUS_CHANGED

Lock wordt alleen gezet wanneer:
- een gebruiker het item daadwerkelijk in edit-modus opent

Selecteren of aanklikken zonder edit zet géén lock.
