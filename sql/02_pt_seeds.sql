-- =================================================================
-- Seeds par défaut — Société montebello
-- À exécuter APRÈS 01_pt_schema.sql
-- Idempotent : ré-exécutable sans casser de données
-- =================================================================

-- ─── 7 typologies de projets (spec §4.1) ────────────────────────
INSERT INTO pt_types_projet (societe_id, code, libelle, icone, couleur, ordre_affichage) VALUES
  ('montebello', 'cuvee-speciale',  'Cuvée spéciale',     'flask',     '#962828', 1),
  ('montebello', 'lancement-gamme', 'Lancement de gamme', 'package',   '#5B3A5C', 2),
  ('montebello', 'evenement',       'Événement',          'calendar',  '#C89B2A', 3),
  ('montebello', 'partenariat',     'Partenariat',        'handshake', '#10b981', 4),
  ('montebello', 'demande-client',  'Demande client',     'user',      '#3b82f6', 5),
  ('montebello', 'projet-interne',  'Projet interne',     'briefcase', '#64748b', 6),
  ('montebello', 'travaux',         'Travaux',            'tool',      '#f59e0b', 7)
ON CONFLICT (societe_id, code) DO NOTHING;

-- ─── Statuts par défaut pour chaque typologie ───────────────────

-- Cuvée spéciale : Idée → Validation → Production → Vieillissement → Embouteillage → Commercialisation → Clôturé
INSERT INTO pt_statuts (type_projet_id, code, libelle, couleur, ordre, est_initial, est_final)
SELECT t.id, s.code, s.libelle, s.couleur, s.ordre, s.est_initial, s.est_final
FROM pt_types_projet t
CROSS JOIN (VALUES
  ('idee',             'Idée',              '#94a3b8', 1, true,  false),
  ('validation',       'Validation',        '#3b82f6', 2, false, false),
  ('production',       'Production',        '#f59e0b', 3, false, false),
  ('vieillissement',   'Vieillissement',    '#a16207', 4, false, false),
  ('embouteillage',    'Embouteillage',     '#7A5278', 5, false, false),
  ('commercialisation','Commercialisation', '#10b981', 6, false, false),
  ('cloture',          'Clôturé',           '#64748b', 7, false, true)
) AS s(code, libelle, couleur, ordre, est_initial, est_final)
WHERE t.societe_id = 'montebello' AND t.code = 'cuvee-speciale'
ON CONFLICT (type_projet_id, code) DO NOTHING;

-- Lancement de gamme : Idée → Validation → Préparation → Production → Lancement → Clôturé
INSERT INTO pt_statuts (type_projet_id, code, libelle, couleur, ordre, est_initial, est_final)
SELECT t.id, s.code, s.libelle, s.couleur, s.ordre, s.est_initial, s.est_final
FROM pt_types_projet t
CROSS JOIN (VALUES
  ('idee',        'Idée',        '#94a3b8', 1, true,  false),
  ('validation',  'Validation',  '#3b82f6', 2, false, false),
  ('preparation', 'Préparation', '#f59e0b', 3, false, false),
  ('production',  'Production',  '#a16207', 4, false, false),
  ('lancement',   'Lancement',   '#10b981', 5, false, false),
  ('cloture',     'Clôturé',     '#64748b', 6, false, true)
) AS s(code, libelle, couleur, ordre, est_initial, est_final)
WHERE t.societe_id = 'montebello' AND t.code = 'lancement-gamme'
ON CONFLICT (type_projet_id, code) DO NOTHING;

-- Événement : Idée → Préparation → Confirmation → Jour J → Bilan → Clôturé
INSERT INTO pt_statuts (type_projet_id, code, libelle, couleur, ordre, est_initial, est_final)
SELECT t.id, s.code, s.libelle, s.couleur, s.ordre, s.est_initial, s.est_final
FROM pt_types_projet t
CROSS JOIN (VALUES
  ('idee',         'Idée',         '#94a3b8', 1, true,  false),
  ('preparation',  'Préparation',  '#3b82f6', 2, false, false),
  ('confirmation', 'Confirmation', '#f59e0b', 3, false, false),
  ('jour-j',       'Jour J',       '#962828', 4, false, false),
  ('bilan',        'Bilan',        '#7A5278', 5, false, false),
  ('cloture',      'Clôturé',      '#64748b', 6, false, true)
) AS s(code, libelle, couleur, ordre, est_initial, est_final)
WHERE t.societe_id = 'montebello' AND t.code = 'evenement'
ON CONFLICT (type_projet_id, code) DO NOTHING;

-- Partenariat : Idée → Négociation → Contrat → Exécution → Bilan → Clôturé
INSERT INTO pt_statuts (type_projet_id, code, libelle, couleur, ordre, est_initial, est_final)
SELECT t.id, s.code, s.libelle, s.couleur, s.ordre, s.est_initial, s.est_final
FROM pt_types_projet t
CROSS JOIN (VALUES
  ('idee',        'Idée',        '#94a3b8', 1, true,  false),
  ('negociation', 'Négociation', '#3b82f6', 2, false, false),
  ('contrat',     'Contrat',     '#f59e0b', 3, false, false),
  ('execution',   'Exécution',   '#10b981', 4, false, false),
  ('bilan',       'Bilan',       '#7A5278', 5, false, false),
  ('cloture',     'Clôturé',     '#64748b', 6, false, true)
) AS s(code, libelle, couleur, ordre, est_initial, est_final)
WHERE t.societe_id = 'montebello' AND t.code = 'partenariat'
ON CONFLICT (type_projet_id, code) DO NOTHING;

-- Demande client : Reçue → Analyse → Devis → En cours → Livrée → Clôturé
INSERT INTO pt_statuts (type_projet_id, code, libelle, couleur, ordre, est_initial, est_final)
SELECT t.id, s.code, s.libelle, s.couleur, s.ordre, s.est_initial, s.est_final
FROM pt_types_projet t
CROSS JOIN (VALUES
  ('recue',    'Reçue',    '#94a3b8', 1, true,  false),
  ('analyse',  'Analyse',  '#3b82f6', 2, false, false),
  ('devis',    'Devis',    '#f59e0b', 3, false, false),
  ('en-cours', 'En cours', '#7A5278', 4, false, false),
  ('livree',   'Livrée',   '#10b981', 5, false, false),
  ('cloture',  'Clôturé',  '#64748b', 6, false, true)
) AS s(code, libelle, couleur, ordre, est_initial, est_final)
WHERE t.societe_id = 'montebello' AND t.code = 'demande-client'
ON CONFLICT (type_projet_id, code) DO NOTHING;

-- Projet interne : Idée → Cadrage → En cours → Bilan → Clôturé
INSERT INTO pt_statuts (type_projet_id, code, libelle, couleur, ordre, est_initial, est_final)
SELECT t.id, s.code, s.libelle, s.couleur, s.ordre, s.est_initial, s.est_final
FROM pt_types_projet t
CROSS JOIN (VALUES
  ('idee',     'Idée',     '#94a3b8', 1, true,  false),
  ('cadrage',  'Cadrage',  '#3b82f6', 2, false, false),
  ('en-cours', 'En cours', '#7A5278', 3, false, false),
  ('bilan',    'Bilan',    '#10b981', 4, false, false),
  ('cloture',  'Clôturé',  '#64748b', 5, false, true)
) AS s(code, libelle, couleur, ordre, est_initial, est_final)
WHERE t.societe_id = 'montebello' AND t.code = 'projet-interne'
ON CONFLICT (type_projet_id, code) DO NOTHING;

-- Travaux : Étude → Devis → Validation → Chantier → Réception → Clôturé
INSERT INTO pt_statuts (type_projet_id, code, libelle, couleur, ordre, est_initial, est_final)
SELECT t.id, s.code, s.libelle, s.couleur, s.ordre, s.est_initial, s.est_final
FROM pt_types_projet t
CROSS JOIN (VALUES
  ('etude',      'Étude',      '#94a3b8', 1, true,  false),
  ('devis',      'Devis',      '#3b82f6', 2, false, false),
  ('validation', 'Validation', '#f59e0b', 3, false, false),
  ('chantier',   'Chantier',   '#962828', 4, false, false),
  ('reception',  'Réception',  '#10b981', 5, false, false),
  ('cloture',    'Clôturé',    '#64748b', 6, false, true)
) AS s(code, libelle, couleur, ordre, est_initial, est_final)
WHERE t.societe_id = 'montebello' AND t.code = 'travaux'
ON CONFLICT (type_projet_id, code) DO NOTHING;

-- ─── Catégories d'étapes par défaut (spec §4.4) ──────────────────
INSERT INTO pt_categories_etapes (societe_id, libelle, ordre) VALUES
  ('montebello', 'Conception',        1),
  ('montebello', 'Production',        2),
  ('montebello', 'Marketing',         3),
  ('montebello', 'Commercialisation', 4),
  ('montebello', 'Administratif',     5),
  ('montebello', 'Autre',             6)
ON CONFLICT DO NOTHING;

-- ─── Catégories de dépenses par défaut (spec §4.7) ───────────────
INSERT INTO pt_categories_depenses (societe_id, libelle, ordre) VALUES
  ('montebello', 'Matières (bouchons, étiquettes, bouteilles)', 1),
  ('montebello', 'Prestations externes',                        2),
  ('montebello', 'Marketing & communication',                   3),
  ('montebello', 'Événementiel',                                4),
  ('montebello', 'Main d''œuvre interne',                       5),
  ('montebello', 'Déplacements',                                6),
  ('montebello', 'Autres',                                      7)
ON CONFLICT DO NOTHING;
