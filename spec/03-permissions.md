# Permissions

Roles per Program:
- VIEWER: read-only access to programs, rundowns, items, assets. Can print.
- EDITOR: can create/edit rundowns, blocks, items, upload assets, set item ready, set item checked (if allowed), reorder.
- ADMIN: all EDITOR permissions + manage program settings, item types, memberships, delete rundowns.

Rules:
- Deleting rundowns: ADMIN only (or EDITOR with explicit delete permission if we add it later).
- Item type management: ADMIN only.
- Eindredactie-check: EDITOR and ADMIN can toggle checked_by_editor (optional later: separate role "FINAL_EDITOR").
- Locks: if item is locked by another user, no edits allowed (read-only).
- Presence: visible to any member with VIEWER+.

VIEWER: ziet kladblok (of eventueel niet—maar ik zou: wél zien, geen edit)
EDITOR: kan kladblok bewerken, soft delete, restore
ADMIN: kan permanent delete