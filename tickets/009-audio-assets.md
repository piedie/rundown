# Ticket 009 — Audio upload + playback

## CONTEXT
Zie `/spec/02-data-model.md`.

## DOEL
Audiofragmenten beheren binnen rundowns.

## SCOPE
- Upload audio (<=15MB)
- Opslag via MinIO (S3)
- Koppelen aan item
- Playback in UI
- Upload → item.ready = true

## ACCEPTATIECRITERIA
- Upload mp3 werkt
- Afspelen in browser
- Viewer kan niet uploaden
- Item wordt automatisch Ready

## UITGESLOTEN
- Waveform rendering
- Cue points

## OUTPUT
- Audio volledig bruikbaar
