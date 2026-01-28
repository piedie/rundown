# Ticket 014 — Item doorzetten naar andere rundown (move/copy)

## DOEL
Een item met research kan naar andere uitzending.

## SCOPE
- Actie “Move to rundown…” en “Copy to rundown…”
- UI in editor: context menu op item
- Move: item krijgt nieuwe rundown_id + behoudt data
- Copy: maak nieuwe item row met dezelfde data + set origin_rundown_item_id
- Audit events voor move/copy

## ACCEPTATIECRITERIA
- Je kunt item naar andere rundown in hetzelfde programma zetten
- Data blijft intact (script, kladblok, ready/checked optioneel reset? -> kies: checked reset, ready blijft)
- Permissions enforced (je moet edit-recht hebben op beide rundowns)

