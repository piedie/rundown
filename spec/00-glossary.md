# Glossary

**Programma**  
Container voor een redactie/uitzending. Bevat leden, item types en rundowns.

**Rundown (draaiboek)**  
Een lijst met items (en blokken) voor één uitzending/dagdeel.

**Blok**  
Groepering in het draaiboek. Kan een target duration hebben (bijv. “10:00”).  
Blokken kunnen ook “separator” of “break” zijn (voor visuele scheiding en timing).

**Item**  
Een regel in het draaiboek (bijv. VO, kort nieuws, live, promo, etc.).  
Items hebben een **planned duration** (altijd handmatig) en optioneel een **actual duration** (run mode).

**Lane (Ready / Preparing)**  
Items staan in één van twee lijsten (zoals in het screenshot):
- **Preparing**: werkvoorraad / items die nog in voorbereiding zijn.
- **Ready**: items die “uitzend-klaar” zijn.

**Asset Ready (klaar met assets)**  
Een onafhankelijke checkbox per item: assets (audio/video/clip) zijn geüpload en gekoppeld.

**Editor Checked (eindredactie akkoord)**  
Een onafhankelijke checkbox per item: eindredactie heeft inhoud gecontroleerd.

**Warnings**  
Het systeem past durations nooit automatisch aan. Het systeem signaleert alleen:
- blok over target
- item mist script/clip/asset (configurable per item type)
- item is nog niet “ready lane” vlak voor start (optioneel later)

**Run mode (light)**  
Een “Start” knop zet de uitzending aan. Je kunt een “current item” markeren en
(optioneel) actual durations vastleggen. Planned durations blijven heilig.
