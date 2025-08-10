# Pilot NC — Copilot Appels d’Offres (V1)

Veille des appels d’offres en Nouvelle-Calédonie, matching explicable, check-list de conformité,
génération de trames (mémoire, DC1/DC2), intégration **ePayNC** (paiements) et **Signature.nc** (signature des déclarations).

## Pile
- Next.js (App Router, TypeScript, Tailwind)
- Supabase (Auth + Postgres + Storage)
- Prisma (abstraction DB, migration prête pour hébergeurs RGPD UE)
- n8n (collecte/parse/score/alertes) — exports JSON fournis
- Intégrations: ePayNC (checkout + webhooks), Signature.nc (stub)

## Démarrage rapide

1. **Env**
   ```bash
   cp .env.example .env.local
   # remplissez les variables Supabase + ePayNC + Signature.nc
   ```

2. **DB (option Prisma local)**
   - Par défaut, l’app parle à Supabase via RLS côté API.
   - Pour outillage / scripts, vous pouvez utiliser `DATABASE_URL` (Postgres) :
   ```bash
   pnpm i  # ou npm i
   npx prisma generate
   ```

3. **Supabase : tables + RLS**
   - Dans le Studio Supabase > SQL editor : exécutez `supabase/sql/01_tables.sql` puis `supabase/sql/02_rls.sql`.

4. **Lancer l’app**
   ```bash
   npm run dev
   # http://localhost:3000
   ```

5. **ePayNC webhooks**
   - Configurez le webhook vers `POST /api/billing/webhook` et renseignez `EPAYNC_WEBHOOK_SECRET`.

## Structure

- `src/app` — pages (landing, dashboard), API routes (`/api/billing/*`, `/api/tenders`, etc.).
- `src/lib` — clients (Supabase, Prisma), intégrations (`epaync`, `signatureNc`), billing.
- `supabase/sql` — création tables et politiques RLS (isolation par organisation).
- `prisma/` — schéma pour migration/portabilité (OVH/Scaleway/Neon/Aiven).
- `n8n/` — exports de workflows (placeholders).

## Migration RGPD (rapide)

- Cible recommandée : **OVHcloud Managed PostgreSQL (EU)** ou **Scaleway Managed PostgreSQL (EU)**.
- Conservez Supabase Auth à court terme ou migrez vers **Auth.js**/**Ory**.
- Stratégie : Prisma → `prisma migrate deploy` sur la base cible, `pg_dump` des données puis bascule DNS/ENV.
- Les API n’exposent aucune donnée sensible inutile; RLS assure l’isolation par org.

## Admin Backend (à implémenter)

- `/admin` protégé par rôle OWNER/ADMIN.
- Dashboard : métriques ingestion, comptes, revenus ePayNC (agg 7/30j).
- CRUD : organisations, utilisateurs (invitation par email), plans/quotas.
- Logs d’audit et opérations : reparse/re-score.

## n8n (workflows)

- `collect_tenders_daily.json` — cron: scrape → parse → upsert `tenders`.
- `score_tenders_per_org.json` — calcule `org_tender_scores` incrémental.
- `send_alerts.json` — envoie emails/WhatsApp selon préférences.
- `billing_retries.json` — relance paiements échoués.
- `housekeeping.json` — purges & maintenance.

> Les fichiers fournis sont des **stubs** pour vous faire gagner du temps sur le mapping; adaptez aux sources réelles et à la politique ePayNC.

## Hero & UX

Le Hero (landing) est dans `src/components/Hero.tsx` avec un design sobre, CTA visibles, et espace “aperçu produit”.
Le parcours client : Landing → Signup → Onboarding (mots-clés/secteurs/budgets/alertes) → Opportunités → Projet → Dossier → Signature → Upgrade via ePayNC.

## Push vers GitHub

```bash
git init
git add .
git commit -m "feat: bootstrap Pilot NC V1"
git branch -M main
git remote add origin <URL_DE_TON_REPO>
git push -u origin main
```

## Licence
MIT
