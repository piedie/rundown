# Scope v2 (koersbijstelling)

Deze scope stuurt de app richting een **professionele rundown grid UI** zoals het screenshot:
- links: boom/lijst met rundowns per programma
- midden: grote tabel (Excel-achtig) met veel kolommen
- boven: status/totalen + Start (run mode light)
- onder (of tweede tabel): **Ready** en **Preparing** lanes

## Must-have (v2 MVP)
### 1) Accounts + programma’s
- Auth + users
- Programma’s + membership + roles (VIEWER | EDITOR | ADMIN)

### 2) Rundown beheer
- Rundown CRUD: maken, bewerken, kopiëren, archiveren
- Rundown metadata: titel, datum (optioneel), **start time (optioneel)**
- Boomstructuur links (groeperen per programma + “Today”)

### 3) Grid editor (zoals screenshot)
- Items CRUD in een tabel (Excel-achtig):
  - drag & drop reorder
  - inline edit van simpele velden (titel, duration, type, lane)
  - detail panel voor rijke velden (script, notes, assets)
- Blokken in de tabel als “header rows”
  - blok target duration
  - automatische block total + +/-
  - eenvoudige overrun warning (blokniveau)

### 4) Lanes: Ready & Preparing
- Elk item heeft een lane: PREPARING of READY
- UI toont twee secties (of tabs) met eigen totalen:
  - Ready list (boven)
  - Preparing list (onder)

### 5) Item states: onafhankelijk
- **asset_ready** (checkbox) en **editor_checked** (checkbox) zijn onafhankelijk
- Rundown is “checked” als alle items editor_checked = true (computed)

### 6) Assets v1
- Upload (<=15MB), attach to item, playback (audio)
- Auto: bij succesvolle upload mag asset_ready automatisch **aan** gezet worden (configurable)
- Asset manager view (tab “Assets” zoals screenshot) voor zoeken/attach (light)

### 7) Samenwerken v1
- Presence (avatars)
- Item lock (alleen bij edit in detail panel)
- Audit log (minimaal: item updated, reorder, lock, upload, lane change)

### 8) Print
- Browser print CSS (A4) van het draaiboek (met blokken, items, durations, scripts)

## Should-have (ontwerp alvast, maar niet bouwen tenzij ticket zegt)
- Sub-rundown (nieuws mini-draaiboek) + roll-up duration
- PDF export server-side
- Waveform + cue points (datamodel alvast)
- Run mode uitgebreider (live timers per item, “next break”, segment logic)

## Out of scope (v2 MVP)
- Mobile optimalisatie
- Echte realtime co-typing
- Integraties (NRCS, playout systems, nieuwsfeeds)
