# Mixò Lounge Bar - web app menu

Prima versione organizzata in cartelle, senza Firebase.

## Avvio

```bash
npm install
cp .env.example .env
# Set a new ADMIN_PASSWORD and SESSION_SECRET in .env
npm run dev
```

`ADMIN_PASSWORD` must be at least 12 characters; do not reuse the old default
password, which was present in the previous client bundle. Generate
`SESSION_SECRET` with `openssl rand -base64 32`. Keep `.env` private; it is
excluded from Git. Changing either value requires restarting the server. The
admin password is checked by the Node server and is never included in the
browser bundle. The admin session uses an HTTP-only cookie and expires after
eight hours. Production requires HTTPS.

For production, build and run the Node server:

```bash
npm run build
npm start
```

## Struttura

- `src/App.jsx`: stato principale e routing interno
- `src/data/defaultData.js`: dati iniziali modificabili dal pannello
- `src/services/storage.js`: salvataggio locale, punto futuro dove collegare Firebase
- `src/components/`: header, footer e navigazione
- `src/views/`: schermate principali dell'app
- `src/styles/GlobalStyle.jsx`: CSS globale bianco/nero (colori del logo)
- `src/utils/`: helper condivisi

Quando passeremo a Firebase, il primo file da sostituire sara `src/services/storage.js`.

## Classifica settimanale

- La logica è in `src/services/weekly.js`: settimana da lunedì 00:00 a domenica 23:59.
- I punti di ogni partita si sommano, con un massimo di partite valide al giorno per persona (si cambia dal pannello, scheda "Gioco").
- A pareggio vince chi ha raggiunto quel punteggio per primo.
- Il lunedì il primo in classifica viene salvato tra i "Vincitori" (pannello, scheda "Classifica settimanale") e i punti ripartono da zero.
- Finché i dati restano in `localStorage` la classifica è solo del singolo telefono: per una gara vera tra clienti serve il database condiviso (Firebase).
