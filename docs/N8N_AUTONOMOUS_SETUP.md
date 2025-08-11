# Scraping autonome portail.marchespublics.nc — toutes les 2h

## Prérequis
- `.env.local` contient `INGEST_SECRET=...`
- Tables/Index existent (`tenders`, `tender_docs`, `tender_requirements`), RLS OK.

## Déploiement
1) Importez `n8n/portail_full_autonomous.json` dans n8n.  
2) Dans le node **Config**:
   - `baseUrl` = URL de votre app (ex: http://localhost:3000)
   - `ingestKey` = valeur de `INGEST_SECRET`
3) Laissez le Cron à **2h** puis **Execute Once** pour tester.

## Ce que fait le workflow
- Récupère la page AllCons, extrait toutes les URLs de consultations,
- Pour chaque consultation: parse les champs (Référence, Intitulé, Organisme, Deadline) et les liens PDF/DOCX/DOC,
- **Upsert** dans `tenders` (idempotent sur (source,ref)),
- **Upsert** les docs dans `tender_docs`,
- **Parse** les docs et renseigne `tender_requirements`.

## Déduplication
- `tenders(source,ref)` unique
- `tender_docs(tender_id,url)` unique
- L’étape parse ne traite que `status in ('queued','pending')`

## Vérification
- Après un run: connectez-vous, visitez `/tenders` (liste),
- Ouvrez `/tenders/<ID>/requirements` pour voir la check-list extraite.
