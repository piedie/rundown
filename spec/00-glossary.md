# Glossary

## Programma (Program)
Een categorie/show (bv. Ontbijt, Nieuws, Economie). Rechten worden per programma geregeld. 

## Rundown
Een draaiboek voor een specifieke uitzending (datum/tijd) binnen één programma.
Een rundown heeft een status (Draft/In productie/Ready/Archived) en een “checked” staat: checked = alle items groen.

## Item
Een regel in een rundown. Items hebben een type (presentatie, jingle, clip, verslaggever, etc.), een duur, teksten/velden, en optioneel assets.

## Blok

Een functionele groepering binnen een rundown.
Blokken hebben:
- een titel
- een volgorde
- een optionele target duration
- een eigen status-indicatie (overrun / ok)

Blokken zijn semantisch belangrijk (bv. Nieuws, Muziek, Reclame),
niet alleen visueel.


## Target duration
Geplande duur op blokniveau (en optioneel op rundown-niveau later). Wordt gebruikt voor waarschuwingen.

## Ready (item)
Betekent: montage/asset/onderdeel is compleet. Bij uploaden van een audio asset kan item automatisch naar Ready.

## Eindredactie-check (green check)
Per item een boolean "checked_by_editor". Als alle items true → rundown.checked = true.

## Sub-rundown (child rundown)
Een item kan verwijzen naar een onderliggende rundown (bv. nieuws mini-draaiboek). De duur van het parent item is default de som van child items (roll-up), tenzij later override wordt toegevoegd.

## Asset
Bestand gekoppeld aan item of rundown: audio/video/afbeelding/pdf. In MVP: audio upload + playback.

## Presence
Zien wie er in dezelfde rundown kijkt/bewerkt.

## Item lock
Wanneer iemand item bewerkt, wordt lock gezet. Anderen zien lock en kunnen niet editen. Lock heeft TTL en heartbeat.

## Taal
In de scope en de code komt soms Engels voor, het eindresultaat is Nederlandstalig.