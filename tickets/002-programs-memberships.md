# Ticket 002 — Programma’s + memberships + rechten

## CONTEXT
Zie `/spec/02-data-model.md` en `/spec/03-permissions.md`.

## DOEL
Programma’s kunnen aanmaken en gebruikers rechten geven per programma.

## SCOPE
- Tabel `programs`
- Tabel `program_memberships`
- Rollen: VIEWER | EDITOR | ADMIN
- UI:
  - Programma-overzicht
  - Programma aanmaken (ADMIN)
  - User toevoegen aan programma met rol

## ACCEPTATIECRITERIA
- ADMIN kan programma maken
- ADMIN kan gebruiker toevoegen met rol
- VIEWER ziet programma maar kan niets wijzigen
- Rechten worden afgedwongen server-side

## UITGESLOTEN
- Rundowns
- Item types

## OUTPUT
- CRUD programma’s
- Rechtenmodel actief
