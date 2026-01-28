# Ticket 004 — Rundown editor: blokken + items + drag & drop

## CONTEXT
Zie `/spec/04-ui.md`.

## DOEL
Een rundown visueel opbouwen met blokken en items.

## SCOPE
- Blokken CRUD
- Items CRUD
- Drag & drop reorder (binnen en tussen blokken)
- Item velden:
  - titel
  - type (nog dummy)
  - duration (mm:ss)
- Automatische total + cume berekening
- item detailpaneel bevat twee tekstvelden: script + kladblok (kladblok kan eerst plain textarea, later rich text).

## ACCEPTATIECRITERIA
- Items verslepen werkt soepel
- Totale duur update realtime
- Cume klopt over hele rundown
- Reload behoudt volgorde

## UITGESLOTEN
- Samenwerken
- Checks
- Audio

## OUTPUT
- Volwaardige editor basis
