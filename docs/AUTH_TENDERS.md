# Lecture RLS de `tenders` (Option B)

Ce patch branche `GET /api/tenders` sur **Supabase avec JWT utilisateur** (header `Authorization: Bearer <token>`).
La policy RLS "tenders lisibles par authenticated" s'applique.

## Tester rapidement
1. Dans **Supabase Studio → Auth → Users**, créez un user avec **email + password**.
2. Lancez l'app, ouvrez **/signin**, connectez-vous.
3. Ouvrez **/tenders** : la page récupère le **token** puis appelle `/api/tenders` avec un header **Bearer**.
4. Vous devriez voir les annonces ingérées par n8n.

## Détails techniques
- `/api/tenders` lit le header `Authorization` et initialise un client Supabase **avec ce token** (`global.headers.Authorization`).
- RLS protège la lecture; sans token → `401`.
- Paramètres disponibles : `q` (recherche ilike sur title/buyer/ref), `limit` (max 100), `offset`, `orderBy`, `orderDir`.

## Variante (SSR cookies)
Vous pouvez aussi utiliser `@supabase/ssr` avec `createServerClient` et les cookies Next, mais la variante **Bearer** est plus simple pour la V1.
