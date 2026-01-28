# Ticket 010 — Sub-rundown (Nieuws mini-draaiboek)

## CONTEXT
Zie `/spec/00-glossary.md` en `/spec/02-data-model.md`.

## DOEL
Nieuws als mini-draaiboek binnen hoofdrundown.

## SCOPE
- Item kan child_rundown_id hebben
- UI knop: “Open sub-draaiboek”
- Child rundown heeft eigen items/blokken
- Parent item duration = som child items

## ACCEPTATIECRITERIA
- Nieuws item opent eigen editor
- Items in sub-rundown tellen op naar parent
- Parent warning werkt met roll-up duration

## UITGESLOTEN
- Meerdere niveaus nesting
- Sub-rundowns mogen niet zelf weer sub-rundowns bevatten.
Maximale nestingdiepte = 1.

## OUTPUT
- Nieuwsblokken professioneel inzetbaar
