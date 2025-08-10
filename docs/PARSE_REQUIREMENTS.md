# Parse des exigences (RC/CCTP) — V1

## 1) Dépendances Node
Installez les parseurs de documents :
```bash
npm i pdf-parse mammoth
```
> OCR (PDF scannés) non inclus en V1.

## 2) SQL
Exécutez `supabase/sql/04_tender_docs.sql` dans Supabase Studio (SQL Editor).

## 3) Secrets
On réutilise `INGEST_SECRET` pour sécuriser :
- `POST /api/ingest/tender-docs`
- `POST /api/parse/tender/:id`

## 4) Flux
1. **n8n** récupère les liens des docs (PDF/DOC/DOCX) depuis la page de l’avis.
2. POST `tenderId` + `docs[]` → `/api/ingest/tender-docs`.
3. POST `/api/parse/tender/:id` → télécharge, parse, extrait des **exigences** → `tender_requirements`.

## 5) Lecture côté app (auth RLS)
- `GET /api/tenders/:id/requirements` (Bearer user token) retourne les exigences.
- UI : page `/tenders/[id]/requirements`.

## 6) Test rapide
```bash
curl -X POST http://localhost:3000/api/ingest/tender-docs  -H "x-ingest-key: $INGEST_SECRET" -H "content-type: application/json"  -d '{"tenderId":"<TENDER_ID>","docs":[{"url":"https://exemple/RC.pdf"},{"url":"https://exemple/CCTP.docx"}]}'
curl -X POST http://localhost:3000/api/parse/tender/<TENDER_ID>  -H "x-parse-key: $INGEST_SECRET"
```
Puis, connecté sur l’app : ouvrez `/tenders/<TENDER_ID>/requirements`.
