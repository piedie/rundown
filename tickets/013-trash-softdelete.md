# Ticket 013 — Prullenbak (soft delete) + herstel

## DOEL
Verwijderen bewaart research en is herstelbaar.

## SCOPE
- Voeg velden `deleted_at`, `deleted_by` toe
- Delete in editor = set deleted_at/by
- Normale editor query filtert deleted items weg
- Nieuw scherm: /rundowns/:id/trash
  - lijst verwijderde items
  - herstel (undelete)
  - permanent delete (ADMIN)

## ACCEPTATIECRITERIA
- Item verdwijnt uit editor na delete
- Item verschijnt in trash met kladblok intact
- Restore zet item terug met alle data
- Permanent delete verwijdert definitief (ADMIN)
