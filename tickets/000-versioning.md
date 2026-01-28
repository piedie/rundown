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

