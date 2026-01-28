# Ticket 011 — Clock View (taartpunten) in apart venster

## CONTEXT
Zie /spec/04-ui.md (Clock View). Gebruik durations uit items en blocks.

## DOEL
Een aparte visuele weergave van de rundown op een klok/cirkel.

## SCOPE
- Nieuwe route: /rundowns/:id/clock
- SVG-render van een cirkel met segmenten (taartpunten)
- Segmentgrootte = item.duration_seconds / total
- Kleur per itemtype (fallback kleur als type nog simpel is)
- Hover tooltip met iteminfo
- Vanuit editor: knop "Open Clock View" -> window.open

## ACCEPTATIECRITERIA
- De view laadt snel (<1s voor 200 items)
- Segmenten kloppen met durations
- Tooltip toont juiste info
- Openen in nieuw venster werkt

## UITGESLOTEN
- Live timer / real-time “on-air” tijd
- Per blok ring-segmenten (komt later)

## OUTPUT
- Functionele Clock View baseline
