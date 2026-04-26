# Montebello — Projets et Tâches

## Vue d'ensemble
4ᵉ module métier de la Suite Montebello. Source de vérité opérationnelle et financière pour les 30-50 projets simultanés (cuvées, gammes, événements, partenariats, demandes clients, internes, travaux). Intègre CRM (bidirectionnel), Coût de Revient (sortant), Datchboard (entrant factures), Portail (auth).

Spec source : `Suivi projet et taches.zip` dans `Dropbox/SMARTFLOW/`.

## Stack technique
- **Frontend** : React 18 + Vite 5 (JSX, pas TS — alignement apps sœurs, voir Déviations)
- **Routing** : react-router-dom 6
- **Charts** : recharts
- **Base de données** : Supabase PostgreSQL (instance partagée `jyuiazhduxizvvbosase`)
- **Auth** : PIN 4 chiffres SHA-256 via `portail_users` + `portail_droits`
- **Déploiement** : Vercel (à connecter — voir TODO Sprint 0)
- **Tables préfixées** : `pt_*`

## Identité visuelle
Sidebar **violet prune `#5B3A5C`** (différenciation des apps sœurs : rouge Tracabilité, moutarde Coût de Revient, vert Rum-app). Hover/actif `#4A2E4B`. CTA principaux `#962828` (rouge Suite Montebello). Police body Source Sans 3.

## Structure des fichiers
```
src/
  App.jsx                              # Routeur (DEV_BYPASS=true par défaut)
  main.jsx                             # Entry point
  styles/global.css                    # Reset + Source Sans 3
  lib/
    supabase.js                        # Client Supabase (createClient)
    AuthContext.jsx                    # Auth PIN SHA-256, permissions, app_id='projets-taches'
    ProtectedRoute.jsx                 # Guard de route avec permission
  components/
    ui.jsx                             # Design system (C, fn, Card, StatCard, Pill, BtnPrimary…)
    layout/AppLayout.jsx               # Sidebar violet prune + navigation + profil
  pages/
    LoginPage.jsx                      # Choix utilisateur + pavé numérique PIN
  modules/
    dashboard/DashboardPage.jsx        # Accueil avec KPIs (placeholder Sprint 0)
sql/
  01_pt_schema.sql                     # 15 tables pt_*
  02_pt_seeds.sql                      # 7 typologies + statuts + catégories
  03_pt_droits_admin_samuel.sql        # Droit admin exclusif Samuel
public/
  logo.png                             # Logo Montebello (copié depuis montebello-portail)
```

## Tables Supabase (pt_*)
**Paramétrage** : `pt_types_projet`, `pt_statuts`, `pt_categories_etapes`, `pt_categories_depenses`
**Projets** : `pt_projets`, `pt_equipe`, `pt_budgets_categorie`
**Étapes** : `pt_phases`, `pt_taches`, `pt_taches_commentaires`, `pt_taches_pj`
**Dépenses** : `pt_depenses`, `pt_factures_non_affectees`
**Système** : `pt_historique_statuts`, `pt_notifications`

Voir `sql/01_pt_schema.sql` pour les détails (FK, contraintes, index).

## Rôles (AuthContext.jsx)
Deux rôles uniquement (simplification spec §2.1) :
- **`admin`** : Samuel exclusivement → toutes permissions
- **`membre`** : tout utilisateur Portail Montebello avec droit sur `app_id='projets-taches'`

Permissions : `view_dashboard`, `view_projets`, `create_projet`, `edit_projet`, `delete_projet`, `validate_depense`, `manage_parametres`, `approve_budget_excess`, `view_admin`. `can(role, action)` vérifie.

## Convention API Supabase
Pattern aligné sur les apps sœurs : appels REST directs (pas le client `@supabase/supabase-js`) via les helpers `sbGet`/`sb` dans chaque module. Le client `supabase.js` reste dispo pour les opérations realtime/auth si besoin.

## Variables d'environnement
```
VITE_SUPABASE_URL=https://jyuiazhduxizvvbosase.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=https://jyuiazhduxizvvbosase.supabase.co/rest/v1
VITE_API_KEY=...
```

## Démarrer en local
```bash
npm install        # ⚠️ Node.js requis (non installé sur la machine au moment du Sprint 0)
cp .env.example .env
npm run dev
```

## Déviations vs spec validée
1. **JSX au lieu de TypeScript** (spec §3.2 → TS, spec §3bis "règle d'or" → align apps sœurs en JSX). Choix : 3bis prime sur 3.2 car les composants copiés des apps sœurs sont en JSX et toute la stack tooling existante est en JSX.
2. **Inline styles au lieu de Tailwind** (idem § 3.2 → Tailwind, §3bis → align apps sœurs en inline styles via `C` palette).
3. **Pas d'enregistrement dans `portail_apps`** : la table mentionnée dans la spec §3bis.2 n'existe PAS en base Supabase au 26 avril 2026. L'enregistrement de l'app se fait uniquement par `portail_droits` (pattern observé sur toutes les apps sœurs : chaimanager, production, tracabilite, crm, entrepot).

## TODO Sprint 0 (à finaliser hors Claude)
- [ ] Installer Node.js LTS (non installé au moment du scaffold)
- [ ] `npm install` + tester `npm run dev`
- [ ] Créer le repo GitHub `montebello-projets-taches`
- [ ] Créer le projet Vercel + connecter le repo + variables d'env
- [ ] Exécuter `sql/01_pt_schema.sql` puis `02_pt_seeds.sql` puis `03_pt_droits_admin_samuel.sql` dans Supabase SQL Editor
- [ ] Vérifier que la card de l'app apparaît dans le Portail Montebello après login Samuel
- [ ] Validation visuelle Samuel : "ça ressemble à une app Montebello"

## Pièges connus (héritage Suite Montebello)
1. `sbGet()` peut retourner un objet erreur si RLS bloque → toujours `Array.isArray(result)`
2. Les tables `portail_*` sont partagées entre toutes les apps : ne JAMAIS les modifier sans coordination
3. `DEV_BYPASS = true` dans `App.jsx` désactive l'auth — passer à `false` avant prod
