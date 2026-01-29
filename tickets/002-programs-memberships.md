# Ticket 002 — Programma’s + memberships + rechten

## CONTEXT
Zie `/spec/02-data-model.md` en `/spec/03-permissions.md`.

## DOEL
Programma’s kunnen aanmaken en gebruikers rechten geven per programma.
autorisatie via server actions / route handlers / API (Node runtime), niet via middleware.

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
- er is een manier om de eerste ADMIN te krijgen (bijv. seed script, of “eerste user is superadmin”,
Datamodel details (constraints)
programs.slug uniek (handig voor URLs)
program_memberships unieke constraint op (program_id, user_id)
role als enum/constraint
UI minimaal, maar bruikbaar
Programma-overzicht: toont alleen programma’s waar je membership op hebt (of superadmin alles).
Admin-scherm: leden toevoegen + rol wijzigen + verwijderen.
Viewer: alleen read.
Audit log haakje
Je wilde audit log later sowieso: voeg “log membership changes” als nice-to-have of minimaal “TODO hooks”.
Versie-afspraak
Na afronding Ticket 002: zet VERSION naar v0.2.0 (en als je een kleine fix erna doet v0.2.1, etc.). Dit past bij je schema.
## UITGESLOTEN
- Rundowns
- Item types

## OUTPUT
- CRUD programma’s
- Rechtenmodel actief
