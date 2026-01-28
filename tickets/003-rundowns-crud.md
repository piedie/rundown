# Ticket 003 — Rundowns CRUD + status + kopiëren

## CONTEXT
Zie `/spec/01-scope-mvp.md` en `/spec/02-data-model.md`.

## DOEL
Rundowns beheren per programma.

## SCOPE
- Rundown tabel
- Status: DRAFT | PROD | READY | ARCHIVED
- UI:
  - Rundown lijst per programma
  - Rundown aanmaken
  - Rundown kopiëren naar nieuwe datum/titel
  - Status wijzigen

## ACCEPTATIECRITERIA
- Editor kan rundown maken/bewerken
- Viewer kan alleen lezen
- Kopiëren maakt nieuwe rundown met lege checks
- Status zichtbaar in lijst

## UITGESLOTEN
- Items
- Blokken

## OUTPUT
- Werkende rundown flow
