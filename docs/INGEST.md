# Ingestion n8n → Next API → Supabase

## 1) SQL (unicité)
Dans Supabase Studio, exécutez `supabase/sql/03_constraints.sql` pour rendre `(source, ref)` unique.

## 2) Secret d’ingestion
Ajoutez à `.env.local` :
```
INGEST_SECRET=remplace-moi
```
Puis redémarrez l'app.

## 3) Endpoint
`POST /api/ingest/tenders`
- Header: `x-ingest-key: $INGEST_SECRET`
- Body: `{ "items": [ { source, ref, buyer, title, category?, amount_min?, amount_max?, deadline_at?, url?, raw_json? }, ... ] }`

L'endpoint fait un **upsert** dans `tenders` avec `onConflict: "source,ref"`.

## 4) n8n workflow
Importez `n8n/collect_marchespublics_daily.json`.
- Node **Config** → `baseUrl` (URL app) et `ingestKey` (= `INGEST_SECRET`).
- Adaptez les sélecteurs du node **HTML Extract** aux pages réelles.
- Lancez (Run Once) pour tester.

## 5) Test manuel
```bash
curl -X POST http://localhost:3000/api/ingest/tenders   -H "x-ingest-key: remplace-moi"   -H "content-type: application/json"   -d '{"items":[{"source":"test","ref":"A-001","buyer":"Province Sud","title":"Balayage routes","url":"https://exemple"}]}'
```

## 6) Visualisation
- `/admin` → cartes de métriques (annonces totales, etc.).
- `GET /api/tenders` sera prochainement branché sur Supabase pour lister les vraies annonces.

## Pourquoi passer par l'endpoint d'app ?
- Évite d'exposer la **service role key** Supabase dans n8n.
- Centralise la logique (filtrage, normalisation, validations).
- Idempotence garantie via `(source, ref)` unique.
