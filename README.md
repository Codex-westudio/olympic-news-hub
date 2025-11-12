# Olympic News Hub

Agrégateur Next.js 14 (App Router) pour suivre les actualités officielles des organisations olympiques. Le projet est structuré en deux étapes :

- **Phase 1 (MVP local)** : toutes les données proviennent de `data/fake_*.json`, filtres/tri/pagination fonctionnent côté client, `/embed/[slug]` rend un carrousel SSR.
- **Phase 2 (Supabase + Auth)** : les API lisent Supabase, scripts de seed/purge alimentent les tables, authentification par lien magique Supabase, tests supplémentaires.

## Stack

- Next.js 14 + TypeScript + App Router
- Tailwind CSS + framer-motion + lucide-react
- Supabase (`@supabase/supabase-js`, auth helpers)
- Vitest + Testing Library (+ test d’intégration API)

## Installation

```bash
# npm
npm install
npm run dev

# pnpm
pnpm install
pnpm dev

# yarn
yarn install
yarn dev
```

L’application écoute sur `http://localhost:3000`.

## Fichier d’environnement

Copie le template :

```bash
cp .env.example .env.local
```

Variables attendues :

- `NEXT_PUBLIC_SITE_URL` : utilisé pour les fetch SSR (embed) – défaut `http://localhost:3000`.
- `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement – **ne jamais** l’exposer côté client).
- `ADMIN_EMAILS` : liste d’emails séparés par des virgules pouvant accéder à `/admin`.

Sans clés Supabase, l’app reste en **Phase 1** avec les données locales.

## Phase 1 – MVP local

1. Lancer `npm run dev`.
2. `/` affiche 36 articles mockés (perPage par défaut = 12).
3. Recherche texte, filtres (sport, type d’organisation, pays, type de contenu, langue, topics) et tri (`date_desc`, `date_asc`, `official_desc`) modifient l’URL (partage facile).
4. Pagination client.
5. `/embed/wa-fr-governance` lit `data/fake_widgets.json`. Ajoute `?fallback=true` pour élargir la fenêtre temporelle (90+ jours) si aucun résultat.
6. `/widgets` offre un builder : choisis des filtres (comme sur `/`), prévisualise le carousel et copie l’iframe pointant vers `/embed/custom?...`.

## Phase 2 – Supabase + Auth

1. **SQL**
   ```bash
   supabase db reset --local --file supabase/supabase.sql
   ```
   - Tables : `profiles`, `sources`, `articles`, `widgets` + vue `v_widget_articles`.
   - Index sur `published_at` et combinaisons de facettes.
   - RLS (lecture publique des articles publiés, widgets publics, propriétaires, etc.).
   - Commentaire rappelant que n8n utilise la clé service role côté serveur uniquement.

2. **Seeder**
   ```bash
   npm run db:seed
   ```
   - `scripts/seed-supabase.ts` marque `is_fake = true` sur `sources`, `articles`, `widgets`.
   - Les sources sont normalisées (`slug`), `topics` conservés, widgets importés (avec `allowed_domains` prêt pour un futur contrôle d’origin).

3. **Purge**
   ```bash
   npm run db:purge
   ```
   - Supprime uniquement les entrées `is_fake = true` sans toucher aux données n8n.

4. **Auth & plans**
   - Page `/auth` déclenche un lien magique. À la première connexion, un profil `trial` (30 j) est créé dans Supabase, puis renouvelé si besoin côté admin.
   - Middleware protège `/widgets` et `/admin` : redirection `/auth` si pas de session, `/admin` seulement pour les emails listés dans `ADMIN_EMAILS`.
   - Page `/` affiche désormais une landing page (hero + plans) tant que l’utilisateur n’est pas connecté ; sinon, on retombe sur la liste d’articles si le plan est actif.

5. **UI**
   - `/` : landing + cards de prix pour les visiteurs, puis l’app originale une fois authentifié.
   - `/widgets` : builder seulement si le plan est actif, sinon message pour choisir une offre.
   - `/admin` : vue tableau pour suivre les profils (`plan`, `plan_expires_at`, `is_active`).
   - `/embed/[slug]` consomme `/api/widget/[slug]`, toujours en SSR via `NEXT_PUBLIC_SITE_URL`.

## Scripts

- `npm run db:seed` : upsert des fausses données (`is_fake=true`).
- `npm run db:purge` : suppression sélective des entrées fake.
- `npm run lint`, `npm run type-check`, `npm run test`.

## Tests

- `tests/filtering.test.ts` : filtres multiples, tri, recherche, buildQueryString (limite à 50).
- `tests/api.articles.test.ts` : mock Supabase, garantit la limite à 50, le tri `official_desc` et l’utilisation de `topics`.
- `tests/widget.api.test.ts` : test d’intégration léger sur `/api/widget/wa-fr-governance`.

Lance-les avec `npm run test`.

## Notes de conception

- `lib/filtering.ts` centralise `applyFilters`, `sortItems`, `paginate`, `buildQueryString` (perPage cap = 50, valeur par défaut documentée).
- Les routes API déclarent une seule fonction `GET` par fichier pour éviter l’erreur “Identifier 'GET' has already been declared”.
- `NEXT_PUBLIC_SITE_URL` est requis pour les embeds SSR (externe ou `localhost`).
- `widgets.allowed_domains` est prévu pour un contrôle d’`Origin` lors d’une future V2.
- Les scripts Supabase utilisent exclusivement la `service role key` côté serveur (workflow n8n, seeder, purge).

## Workflow Git

```bash
# Vérifier l'état local
git status

# Mettre en scène les fichiers modifiés
git add .          # ou git add <fichier>

# Créer un commit
git commit -m "feat: décrire la modification"

# Pousser sur le dépôt GitHub
git push origin main
```

Si tu dois (ré)utiliser HTTPS sur une nouvelle session/machine :
```bash
git remote set-url origin https://github.com/Codex-westudio/olympic-news-hub.git
git push -u origin main   # Git demandera ton token Codex-westudio
```

Pour récupérer les changements avant de repartir :
```bash
git pull --rebase origin main
```
