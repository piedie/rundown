# MVP Scope

## Must-have (MVP)
- Auth + users
- Programma's + membership + roles (view/edit/delete)
- Rundown CRUD: maken, bewerken, kopiëren, archiveren
- Items CRUD met drag & drop reorder
- Blokken: items kunnen onder een blok vallen + blok target duration
- Duration per item (mm:ss) + automatische total/cume berekening
- Overrun warnings op blokniveau (simpel)
- Eindredactie-check per item + rundown checked als alles groen
- Samenwerken v1: presence + item lock + audit log
- Audio assets: upload (<=15MB), attach to item, playback, auto-set item Ready bij upload
- Print view (browser print CSS)
- Ready (montage/asset klaar) en Checked (eindredactie akkoord)
zijn volledig onafhankelijke staten.
- Het systeem past durations nooit automatisch aan.
Het systeem signaleert alleen (warnings), de redactie beslist.


## Should-have (na MVP, maar ontwerp alvast)
- Sub-rundown (nieuws mini-draaiboek) + roll-up duration
- PDF export server-side (mooier dan print)
- Waveform + cue points (datamodel alvast)
- “Run mode light”: current item + prev/next

## Nice to have

- Integraties (NRCS, playout systems, nieuwsfeeds)
- Geavanceerde audio bewerking (fade rendering), alleen metadata

## Out of scope (MVP)
- Mobile optimalisatie
- Echte realtime tekstcollab (Google Docs)


## Versioning
- App gebruikt semantische versie in formaat: v0.<milestone>.<patch>
- Versie wordt gelezen uit centraal VERSION-bestand in repo-root
- Versie is zichtbaar in UI footer
- Versie wordt gelogd bij audit events
