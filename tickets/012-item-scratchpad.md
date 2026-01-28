# Ticket 012 — Kladblok per item (scratchpad)

## DOEL
Elk item heeft naast presentatietekst een kladblok voor research.

## SCOPE
- Voeg veld `scratchpad` toe aan rundown_items (rich json of text)
- UI: item detailpanel met tabs:
  - Script (presenter_script)
  - Kladblok (scratchpad)
- Opslaan + laden + audit event ITEM_UPDATED

## ACCEPTATIECRITERIA
- Kladblok blijft behouden bij edits/reorder
- Viewer kan lezen, editor kan bewerken
