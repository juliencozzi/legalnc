# n8n — Collecte Portail Marchés Publics NC (AllCons) → DCE → Parse

## 1) Importer le workflow
- Fichier: `n8n/portail_marchespublics_collect_and_parse.json`
- Ouvrez n8n → Import → Chargez le JSON.
- Ouvrez le node **Config** et remplacez :
  - `baseUrl` par l’URL de votre app (ex: `http://localhost:3000` ou l’URL Vercel)
  - `ingestKey` par la valeur de `INGEST_SECRET` (définie dans `.env.local`)
  - Optionnel: `userAgent` si vous voulez une signature différente.

## 2) Next.js / Supabase
- Exécutez `supabase/sql/05_tender_docs_kind.sql` (ajoute la colonne `kind`).
- Remplacez votre `src/app/api/ingest/tender-docs/route.ts` par celui fourni (gère `kind`).
- Déjà présent depuis les updates précédents :
  - `POST /api/parse/tender/:id` (protégé par `INGEST_SECRET`)
  - `GET /api/tenders/:id/requirements` (auth RLS)

## 3) Flux du workflow
1. **Fetch Listing** (page AllCons) → extrait les URLs de consultations (id, org).
2. Pour chaque consultation: construit l’URL **DCE**, télécharge la page, extrait les liens de documents.
3. **Classify** chaque lien: `RC`, `CCTP`, `CCAP`, `DUME`, `AE`, `BPU`, `ANNEXE`, `PDF`, `WORD`, `OTHER`.
4. POST **/api/ingest/tender-docs** avec `{ tenderId, docs[] }`.
5. Attente courte, puis POST **/api/parse/tender/:id** pour extraire le texte et les exigences (heuristiques).

## 4) Fréquence & politesse
- Le Cron est réglé sur **toutes les 2 heures**. Ajustez si besoin.
- Évitez de marteler le portail : gardez des attentes (Wait) et un User-Agent clair.
- Vous pouvez limiter l’import aux consultations **récentes** en ajoutant un filtre en amont (prochaine itération).

## 5) Test rapide
- Dans n8n: ouvrez le workflow, cliquez **Execute Once**.
- Sur votre app: connectez-vous, puis visitez `/tenders/<TENDER_ID>/requirements` pour un ID connu.

## 6) Débogage
- Si la page liste change, adaptez le regex du node **Extract Consultation URLs**.
- Si des liens sont relatifs, le Function **Map Docs + Classify** les transforme en absolus.
- Si parsing PDF/DOCX échoue: vérifiez `npm i pdf-parse mammoth` côté projet et inspectez les logs du route `parse`.
