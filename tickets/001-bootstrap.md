# Ticket 001 — Repo bootstrap + Docker + Auth skeleton

## CONTEXT
Volg strikt de documentatie in `/spec/*`. Dit is de enige bron van waarheid.
Stack: Next.js (App Router) + TypeScript + Tailwind + Postgres + Docker + Auth.js.

Domeinen:
- App: https://app.landstede.live
- WebSocket: wss://ws.landstede.live

## DOEL
Een draaiende basisapp met:
- werkende Docker setup
- database connectie
- login/logout
- lege homepage na login

## SCOPE
- Next.js project initialiseren
- Dockerfiles aanmaken (`docker/Dockerfile`, `docker/Dockerfile.realtime`)
- `docker-compose.yml` en `Caddyfile` werkend maken
- Auth.js configureren met credentials provider
- Database connectie (nog geen domeinlogica)

## ACCEPTATIECRITERIA
- `docker compose up -d --build` start zonder errors
- https://app.landstede.live toont login
- Login werkt met testuser
- Na login: simpele “Logged in” pagina
- Database connectie getest via health endpoint

## UITGESLOTEN
- Geen programma’s
- Geen rundowns
- Geen realtime logica

## OUTPUT
- Werkende repo
- Instructie hoe testuser is aangemaakt

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
