-- =================================================================
-- RLS — Politiques permissives pour les tables pt_*
-- Pattern : aligné sur rls_activation.sql (Suite Montebello)
-- Logique : RLS activé + policy "Accès complet anon et auth"
--          (sécurité gérée côté app via PIN auth Portail, pas RLS)
-- À exécuter APRÈS 01_pt_schema.sql et 02_pt_seeds.sql
-- =================================================================

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'pt_types_projet',
    'pt_statuts',
    'pt_categories_etapes',
    'pt_categories_depenses',
    'pt_projets',
    'pt_equipe',
    'pt_budgets_categorie',
    'pt_phases',
    'pt_taches',
    'pt_taches_commentaires',
    'pt_taches_pj',
    'pt_depenses',
    'pt_factures_non_affectees',
    'pt_historique_statuts',
    'pt_notifications'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Accès complet anon et auth" ON %I', t);
    EXECUTE format('CREATE POLICY "Accès complet anon et auth" ON %I FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- Vérification : nombre de policies par table
SELECT tablename, COUNT(*) AS nb_policies
FROM pg_policies
WHERE tablename LIKE 'pt_%'
GROUP BY tablename
ORDER BY tablename;
