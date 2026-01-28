# Ticket 008 — Audit log

## CONTEXT
Zie `/spec/02-data-model.md`.

## DOEL
Herleidbaarheid van wijzigingen.

## SCOPE
- Tabel audit_events
- Log bij:
  - item edit
  - reorder
  - check toggle
  - ready toggle
  - asset upload
- UI: simpele audit panel (chronologisch)

## ACCEPTATIECRITERIA
- Elke actie wordt gelogd
- Log toont user + tijd + actie
- Alleen leesbaar (niet bewerkbaar)

## OUTPUT
- Betrouwbaar logboek
