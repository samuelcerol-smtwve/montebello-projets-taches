-- =================================================================
-- Module Projets et Tâches — Schéma complet
-- Préfixe : pt_*
-- Source : SPEC_Projets_Taches.md §5 (validée Samuel Cerol, 23 avril 2026)
-- =================================================================

-- ─── 1. PARAMÉTRAGE ─────────────────────────────────────────────

-- Types de projets (paramétrable admin)
CREATE TABLE IF NOT EXISTS pt_types_projet (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  societe_id      text NOT NULL REFERENCES portail_societes(id),
  code            text NOT NULL,
  libelle         text NOT NULL,
  icone           text,
  couleur         text,
  ordre_affichage int,
  actif           boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(societe_id, code)
);

-- Statuts par type (cycle de vie configurable)
CREATE TABLE IF NOT EXISTS pt_statuts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_projet_id uuid NOT NULL REFERENCES pt_types_projet(id) ON DELETE CASCADE,
  code           text NOT NULL,
  libelle        text NOT NULL,
  couleur        text,
  ordre          int NOT NULL,
  est_initial    boolean DEFAULT false,
  est_final      boolean DEFAULT false,
  UNIQUE(type_projet_id, code)
);

-- Catégories d'étapes (paramétrable admin)
CREATE TABLE IF NOT EXISTS pt_categories_etapes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  societe_id text NOT NULL REFERENCES portail_societes(id),
  libelle    text NOT NULL,
  ordre      int,
  actif      boolean DEFAULT true
);

-- Catégories de dépenses (paramétrable admin)
CREATE TABLE IF NOT EXISTS pt_categories_depenses (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  societe_id text NOT NULL REFERENCES portail_societes(id),
  libelle    text NOT NULL,
  ordre      int,
  actif      boolean DEFAULT true
);

-- ─── 2. PROJETS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pt_projets (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  societe_id          text NOT NULL REFERENCES portail_societes(id),
  reference           text NOT NULL,
  titre               text NOT NULL,
  description         text,
  type_projet_id      uuid NOT NULL REFERENCES pt_types_projet(id),
  statut_id           uuid NOT NULL REFERENCES pt_statuts(id),
  responsable_id      uuid NOT NULL REFERENCES portail_users(id),
  cree_par            uuid NOT NULL REFERENCES portail_users(id),
  date_creation       timestamptz DEFAULT now(),
  date_debut          date,
  date_fin_prevue     date,
  date_fin_reelle     date,
  visibilite          text NOT NULL DEFAULT 'prive' CHECK (visibilite IN ('prive', 'public')),
  budget_global       numeric(12, 2),
  client_crm_id       uuid,
  produit_fini_crm_id uuid,
  note_cloture        text,
  archive             boolean DEFAULT false,
  date_archivage      timestamptz,
  UNIQUE(societe_id, reference)
);

CREATE INDEX IF NOT EXISTS idx_pt_projets_societe   ON pt_projets(societe_id);
CREATE INDEX IF NOT EXISTS idx_pt_projets_statut    ON pt_projets(statut_id);
CREATE INDEX IF NOT EXISTS idx_pt_projets_resp      ON pt_projets(responsable_id);
CREATE INDEX IF NOT EXISTS idx_pt_projets_archive   ON pt_projets(archive);

-- Équipe projet
CREATE TABLE IF NOT EXISTS pt_equipe (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id  uuid NOT NULL REFERENCES pt_projets(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES portail_users(id),
  role       text NOT NULL CHECK (role IN ('responsable', 'contributeur', 'observateur')),
  date_ajout timestamptz DEFAULT now(),
  UNIQUE(projet_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pt_equipe_user ON pt_equipe(user_id);

-- ─── 3. BUDGET PAR CATÉGORIE ────────────────────────────────────

CREATE TABLE IF NOT EXISTS pt_budgets_categorie (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id            uuid NOT NULL REFERENCES pt_projets(id) ON DELETE CASCADE,
  categorie_depense_id uuid NOT NULL REFERENCES pt_categories_depenses(id),
  montant_prevu        numeric(12, 2) NOT NULL,
  UNIQUE(projet_id, categorie_depense_id)
);

-- ─── 4. ÉTAPES (CATÉGORIE → PHASE → TÂCHE) ──────────────────────

CREATE TABLE IF NOT EXISTS pt_phases (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id          uuid NOT NULL REFERENCES pt_projets(id) ON DELETE CASCADE,
  categorie_etape_id uuid NOT NULL REFERENCES pt_categories_etapes(id),
  libelle            text NOT NULL,
  ordre              int NOT NULL,
  date_debut_prevue  date,
  date_fin_prevue    date
);

CREATE INDEX IF NOT EXISTS idx_pt_phases_projet ON pt_phases(projet_id);

CREATE TABLE IF NOT EXISTS pt_taches (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id           uuid NOT NULL REFERENCES pt_phases(id) ON DELETE CASCADE,
  libelle            text NOT NULL,
  description        text,
  responsable_id     uuid REFERENCES portail_users(id),
  statut             text NOT NULL DEFAULT 'a_faire'
                     CHECK (statut IN ('a_faire', 'en_cours', 'fait', 'bloque', 'ignore')),
  date_echeance      date,
  date_completion    timestamptz,
  depend_de_tache_id uuid REFERENCES pt_taches(id),
  motif_ignore       text,
  ordre              int,
  created_at         timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pt_taches_phase  ON pt_taches(phase_id);
CREATE INDEX IF NOT EXISTS idx_pt_taches_resp   ON pt_taches(responsable_id);
CREATE INDEX IF NOT EXISTS idx_pt_taches_statut ON pt_taches(statut);

CREATE TABLE IF NOT EXISTS pt_taches_commentaires (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tache_id   uuid NOT NULL REFERENCES pt_taches(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES portail_users(id),
  contenu    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pt_taches_pj (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tache_id     uuid NOT NULL REFERENCES pt_taches(id) ON DELETE CASCADE,
  url          text NOT NULL,
  nom_fichier  text,
  taille_bytes bigint,
  uploaded_by  uuid REFERENCES portail_users(id),
  created_at   timestamptz DEFAULT now()
);

-- ─── 5. DÉPENSES ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pt_depenses (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id                  uuid NOT NULL REFERENCES pt_projets(id) ON DELETE CASCADE,
  categorie_depense_id       uuid REFERENCES pt_categories_depenses(id),
  libelle                    text NOT NULL,
  montant                    numeric(12, 2) NOT NULL,
  date_depense               date NOT NULL,
  source                     text NOT NULL CHECK (source IN ('datchboard', 'mo_interne', 'manuelle')),
  facture_datchboard_id      text,
  mo_heures                  numeric(6, 2),
  mo_taux_horaire            numeric(8, 2),
  statut_validation          text NOT NULL DEFAULT 'en_attente'
                             CHECK (statut_validation IN ('en_attente', 'validee', 'refusee')),
  motif_refus                text,
  approbation_exceptionnelle boolean DEFAULT false,
  motif_exception            text,
  cree_par                   uuid NOT NULL REFERENCES portail_users(id),
  valide_par                 uuid REFERENCES portail_users(id),
  date_validation            timestamptz,
  piece_justificative_url    text,
  created_at                 timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pt_depenses_projet  ON pt_depenses(projet_id);
CREATE INDEX IF NOT EXISTS idx_pt_depenses_statut  ON pt_depenses(statut_validation);

-- ─── 6. FILE FACTURES NON AFFECTÉES (Datchboard) ────────────────

CREATE TABLE IF NOT EXISTS pt_factures_non_affectees (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  societe_id            text NOT NULL REFERENCES portail_societes(id),
  facture_datchboard_id text NOT NULL,
  libelle               text NOT NULL,
  montant               numeric(12, 2) NOT NULL,
  date_facture          date NOT NULL,
  traitee               boolean DEFAULT false,
  projet_id             uuid REFERENCES pt_projets(id),
  created_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pt_factures_traitee ON pt_factures_non_affectees(traitee);

-- ─── 7. HISTORIQUE & NOTIFICATIONS ──────────────────────────────

CREATE TABLE IF NOT EXISTS pt_historique_statuts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id         uuid NOT NULL REFERENCES pt_projets(id) ON DELETE CASCADE,
  ancien_statut_id  uuid REFERENCES pt_statuts(id),
  nouveau_statut_id uuid NOT NULL REFERENCES pt_statuts(id),
  change_par        uuid REFERENCES portail_users(id),
  commentaire       text,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pt_notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES portail_users(id),
  projet_id       uuid REFERENCES pt_projets(id),
  tache_id        uuid REFERENCES pt_taches(id),
  type            text NOT NULL,
  message         text NOT NULL,
  lien_contextuel text,
  lu              boolean DEFAULT false,
  date_lecture    timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pt_notif_user_lu ON pt_notifications(user_id, lu);

-- =================================================================
-- FIN du schéma. Jeux de données par défaut → 02_pt_seeds.sql
-- =================================================================
