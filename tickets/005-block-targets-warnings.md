# Ticket 005 — Block target duration + overrun warnings

## CONTEXT
Zie `/spec/00-glossary.md` en `/spec/02-data-model.md` en `/spec/04-ui.md`

## DOEL
Aanpassen van de UI op basis van de nieuwe specs
Planned vs actual inzicht per blok.

## SCOPE
- Target duration per blok (mm:ss)
- Bereken actual = som items
- Warning wanneer actual > target
- UI:
  - Target
  - Actual
  - +/- indicator
  - Visuele waarschuwing

## ACCEPTATIECRITERIA
- Blok met target 10:00 en items 11:30 toont warning
- Warning update bij drag & drop
- Geen blocking, alleen signalerend

## OUTPUT
- Basis timingcontrole actief
