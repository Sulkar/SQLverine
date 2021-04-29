
# SQLverine
<img src="images/sqlVerine-logo.png" width="400px" />

SQLverine ist ein einfacher online SQL Editor für SQLite Datenbanken, der Schülerinnen und Schülern den Einstieg in das Thema Datenbanken und SQL Abfragen auf spielerische Weise ermöglicht.

### Demo
:mag_right: [SQLverine - SQL Editor](https://sulkar.github.io/SQLverine/)


## Idee 
Im bayrischen LehrplanPLUS der Mittelschulen für das Fach Informatik dreht es sich in der 10. Jahrgangsstufe überwiegend um Datenbanken. Dabei sollen die Schüler*innen auch lernen Datenbankabfragen mit SQL zuerstellen. Im Prinzip würde hierzu ein einfacher Texteditor reichen, um mit dem Programmieren zu beginnen. Die Erfahrung zeigt aber, dass immer, wenn Schüler*innen Text zum Erstellen eines Programms schreiben müssen, Syntaxfehler ein großes Problem darstellen. Diese zu finden führt bei Lehrkräften und Schüler*innen schnell zu einer hohen Frustration. Die eigentliche Logik beim Erstellen einer Abfrage mit SQL rückt in den Hintergrund.

<img src="images/bildSql.png" width="400px" />

Um im Stil von Scratch mit der Programmierung von SQL Abfragen fortfahren zu können, haben Richard Scheglmann und Benjamin Vötterle recherchiert. Bei unserer Recherche haben wir als fertige Umgebung eigentlich nur [SQL Snap](https://snapextensions.uni-goettingen.de/sqlsnap.html) gefunden, welches wir nicht gerade ansprechend fanden. Gerade das Datenbankhandling dürfte die ein oder andere Lehrkraft hier vor größere Herausforderungen stellen.

Aus diesem Grund haben wir beschlossen, selbst einen SQL Editor zu entwickeln, der folgende Features mitbringen soll:
- Browserbasiert -> keine Installation notwendig, läuft auch auf mobilen Endgeräten (responsive Design)
- Benötigt kein kompliziertes Datenbanksystem im Hintergrund
- Einfaches austauschen von Datenbanken (SQLite) möglich
- Einfach zu bedienende Oberfläche

Folgende Features sind bereits umgesetzt:
-	Vorhandene Datenbanken verwenden
-	Datenbanken können geöffnet und gespeichert werden
-	SQL Befehle zum Abfragen, Hinzufügen und Verändern von Daten
-	Ausgabe von Abfrage Ergebnissen
-	Anzeige des Datenbank Schemas


## Lizenz
Das Urheberrecht für diese Zusammenstellung liegt bei Richard Scheglmann und Benjamin Vötterle. Die Weitergabe und Nutzung dieser Inhalte und Software sowie die Veränderung ist gestattet, sofern die folgenden Bedingungen eingehalten werden: 

### Namensnennung 

Die Weitergabe muss als Autoren Richard Scheglmann und Benjamin Vötterle nennen. Dazu muss der Text dieser Lizenz angegeben werden. Dies kann wie hier im Werk oder als einzelne Datei (z.B. im Anhang eines Werkes) erfolgen. Weitere Angaben sind nicht notwendig. 

### Kostenfreiheit 

Dieses Werk, Bearbeitungen oder Übersetzungen und Werke, die auf diesem Werk beruhen oder dieses verwenden, müssen unentgeltlich weitergegeben werden. Wird davon eine gedruckte Version erstellt, muss zumindest eine digitale Version dem gleichen Empfängerkreis ebenfalls kostenfrei zugänglich sein. 

### Datensparsamkeit 

Erfolgt die Bereitstellung außerhalb einer öffentlichen Bildungseinrichtung oder einer Bildungseinrichtung in freier, nichtöffentlicher Trägerschaft, muss der Zugang dazu ohne Benutzerregistrierung, Erhebung von personenbezogenen Daten mit Ausnahme der technischen Verbindungsparameter oder einer Anforderung des Dokuments per Formular oder Mail (nötigenfalls durch Bereitstellung über einen weiteren Endpunkt) erfolgen.

## Verwendete Libraries und Frameworks
- :pencil2: [SQLverine authoring tool](https://github.com/Sulkar/SQLverine-authoring-tool)
- :open_book: [SQLite Dokumentation](https://github.com/Sulkar/sqlite-dokumentation/)
- [SQL.JS](https://sql.js.org/)
- [jQuery](https://jquery.com/)
- [Bootstrap](https://getbootstrap.com/)
