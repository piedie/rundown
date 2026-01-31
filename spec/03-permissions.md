# Permissions

## Roles
- VIEWER: read-only
- EDITOR: CRUD op rundowns/items binnen programma
- ADMIN: alles + manage item types + manage memberships

## Rules (server-side enforce)
- Alle writes checken program_memberships.role
- VIEWER mag geen locks zetten (optioneel), of alleen read-only presence
- Soft delete: alleen EDITOR/ADMIN
- Permanent delete: alleen ADMIN (prullenbak)

## Lanes + states
- Lane change (PREPARING <-> READY) is een normale item update (EDITOR+)
- asset_ready en editor_checked mogen door EDITOR gezet worden
- Optioneel later: editor_checked alleen voor users met rol “EINDREDACTIE” (niet in v2 MVP)
