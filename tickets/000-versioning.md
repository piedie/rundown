# Ticket 000 — App versioning + footer display

## CONTEXT
Versies worden bijgehouden volgens formaat: v0.<milestone>.<patch>.

## DOEL
Zichtbaar maken welke versie van de app draait.

## SCOPE
- VERSION bestand in repo-root
- App leest VERSION server-side
- Footer toont huidige versie
- Versie beschikbaar in code (config/context)
- (Optioneel) app_version opslaan in audit_events

## ACCEPTATIECRITERIA
- Versie in footer komt overeen met VERSION bestand
- Bij wijziging VERSION en rebuild is nieuwe versie zichtbaar
- Geen hardcoded versies in code

## UITGESLOTEN
- Automatische CI versie-bumping
- Release notes UI

# Ticket checklist

## Build & run
- [ ] `docker compose up -d --build` succeeds
- [ ] No errors in `docker compose logs` for app/realtime/postgres/minio/caddy
- [ ] App loads at https://app.landstede.live

## Security
- [ ] Server-side authorization enforced for all mutations
- [ ] VIEWER cannot mutate anything
- [ ] Cross-program access is blocked

## Data integrity
- [ ] Migrations applied cleanly
- [ ] Fresh DB boot works
- [ ] Seed/test users exist (documented)

## UX
- [ ] UI matches /spec/04-ui.md for relevant screen(s)
- [ ] Loading/error states exist
- [ ] No broken navigation routes

## Versioning
- [ ] /VERSION updated correctly
- [ ] Footer shows new version

## Manual test steps
- [ ] Steps written and verified by developer
