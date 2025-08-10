# Update 1 — Admin, Pricing, Onboarding, Billing pages

## Nouvelles routes
- `/admin` (Dashboard)
- `/pricing` (plans + checkout ePayNC)
- `/onboarding` (profil de matching)
- `/billing/success`, `/billing/cancel`

## Nouvelles APIs
- `GET /api/admin/metrics` — nécessite `ADMIN_API_KEY` en header `x-admin-key` (temporaire)

## Nouvelles libs
- `src/lib/supabaseAdmin.ts` — client admin (service role) côté serveur

## Env à compléter
```
ADMIN_API_KEY=change-me
```
Ajoute aussi (déjà présent) : `SUPABASE_SERVICE_ROLE_KEY` pour l'API admin.

## Prochaines étapes
- Remplacer la clé admin par un vrai contrôle de rôles (OWNER/ADMIN) via Supabase Auth.
- Connecter la page Dashboard aux données réelles (opportunités org) et au parsing n8n.
- Implémenter le vrai flux ePayNC (appel API au lieu du stub) et mapping webhooks → `subscriptions`.
