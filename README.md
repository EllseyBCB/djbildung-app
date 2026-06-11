# D+J Bildung – Beratungs-App (PWA)

Installierbare Web-App (PWA) von **D+J Bildung** mit Rechnern (Provision, Förderung),
Angebotsgenerator und Beratung. Reines HTML/CSS/JavaScript – kein Build-Schritt nötig.

## Dateien
- `index.html` – Haupt-App (Rechner, Beratung)
- `angebotsgenerator.html` – Kundenangebot / CashFlow als PDF
- `manifest.json` – macht die App installierbar
- `service-worker.js` – App-Start + Offline-Grundfunktion
- `icons/` – App-Icons
- `netlify.toml` – Netlify-Konfiguration (statische Seite)

## Veröffentlichen
Hosting über **Netlify**, verbunden mit diesem GitHub-Repository:
Jede Änderung im `main`-Branch wird automatisch live veröffentlicht.

## Lokal testen
Service Worker brauchen `http(s)` (nicht `file://`). Lokaler Test:

```
python -m http.server 8099
```

Dann im Browser `http://localhost:8099` öffnen.

## Hinweis zu Updates
Nach Code-Änderungen die Versionsnummer in `service-worker.js` erhöhen
(`djbildung-v1` → `djbildung-v2` …), damit Nutzer die neue Version erhalten.
