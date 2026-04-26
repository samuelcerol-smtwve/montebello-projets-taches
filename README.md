# Montebello — Projets et Tâches

Module de pilotage des projets de la Distillerie Montebello. Phase 1 : projets structurés (cuvées, gammes, événements…), équipes, budgets, vues Kanban/Liste/Calendrier, intégrations CRM/Coût de Revient/Datchboard.

> Spec source : `Suivi projet et taches.zip` (validée Samuel Cerol, 23 avril 2026).
> Documentation interne : voir [`CLAUDE.md`](./CLAUDE.md).

## Démarrage rapide

```bash
npm install
cp .env.example .env       # éditer si besoin
npm run dev                # http://localhost:5173
```

## Avant le premier déploiement

1. **Supabase** : exécuter dans l'ordre (SQL Editor)
   1. `sql/01_pt_schema.sql` — crée les 15 tables `pt_*`
   2. `sql/02_pt_seeds.sql` — 7 typologies + statuts + catégories
   3. `sql/03_pt_droits_admin_samuel.sql` — droit admin exclusif Samuel

2. **GitHub** : créer le repo `montebello-projets-taches`, push `main`

3. **Vercel** : créer le projet, connecter le repo, renseigner :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL`
   - `VITE_API_KEY`

4. **App.jsx** : passer `DEV_BYPASS` à `false`

## Stack
React 18 · Vite 5 · React Router 6 · Supabase · Recharts · Source Sans 3

## Identité visuelle
Sidebar **violet prune `#5B3A5C`** — variation de la charte Suite Montebello pour différencier des apps sœurs (Tracabilité rouge, Coût de Revient moutarde, Rum-app vert).
