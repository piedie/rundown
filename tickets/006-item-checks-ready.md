# Ticket 006 — Eindredactie-check + Ready status

## CONTEXT
Zie `/spec/00-glossary.md`.

## DOEL
Redactionele afronding zichtbaar maken.

## SCOPE
- Per item:
  - ready (bool)
  - checked_by_editor (bool)
- Rundown.checked = true als alle items checked
- UI:
  - Groen vinkje per item
  - Indicator bij rundown “Alles gecheckt”

## ACCEPTATIECRITERIA
- 1 unchecked item → rundown unchecked
- Alles groen → rundown checked
- Ready en checked zijn los van elkaar

## OUTPUT
- Redactionele status inzichtelijk
