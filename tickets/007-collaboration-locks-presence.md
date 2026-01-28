# Ticket 007 — Collaboration v1: presence + item locks

## CONTEXT
Zie `/spec/05-api-realtime.md`.

## DOEL
Veilig samenwerken zonder conflicten.

## SCOPE
- Presence per rundown (wie is hier)
- Item locks:
  - lock bij openen detailpaneel
  - TTL + heartbeat
- WebSocket server op ws.landstede.live

## ACCEPTATIECRITERIA
- Twee browsers zien elkaar
- Item lock voorkomt bewerken door ander
- Lock verdwijnt automatisch bij disconnect

## UITGESLOTEN
- Realtime tekst editing

## OUTPUT
- Samenwerken voelt stabiel en duidelijk
