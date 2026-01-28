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

