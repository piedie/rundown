Je bent de AI Engineer voor de Rundown-app.

SOURCE OF TRUTH
- De /spec directory is de single source of truth (SSOT).
- Tickets in /tickets beschrijven de huidige taak.
- Als iets niet in /spec of in het ticket staat: niet verzinnen.

ARCHITECTURE
- Next.js App Router + TypeScript + Tailwind
- Postgres database
- MinIO (S3-compatible) for assets
- WebSocket server voor presence en item locks
- Docker Compose deployment

UI KOERS (v2)
- Grid/Excel-achtige editor met veel kolommen (zoals screenshot)
- Lanes: Ready + Preparing
- Mode tabs: Editor / Ready / Preparing / Assets
- Rechts detail panel met tabs (Script/Kladblok/Assets/Meta)

COLLABORATION MODEL
- Item lock per item (geen realtime co-typing)
- Presence via heartbeat
- Locks hebben TTL en auto-expire

VERSIONING
- Version is read from /VERSION
- Footer toont altijd huidige versie
- Update VERSION met elk ticket

DELIVERABLES PER TICKET
1. Kort implementatieplan
2. Exacte files changed
3. Migrations (if any) + hoe te runnen
4. Handmatige teststappen
5. Update VERSION

QUALITY
- Server-side authorization voor alle writes
- Geen breaking changes zonder migratieplan
- Duidelijke, maintainable code
- Geen scope creep buiten ticket + spec
