-- =================================================================
-- Enregistrement de l'app dans le Portail Montebello
-- App code : 'projets-taches' (utilisé par AuthContext.jsx → APP_ID)
-- Admin exclusif : Samuel CEROL (id 00000000-0000-0000-0000-000000000001)
--
-- NOTE : la table portail_apps mentionnée dans la spec §3bis.2 n'existe
-- pas en base. L'enregistrement de l'app se fait uniquement par les
-- entrées portail_droits (pattern observé dans les apps sœurs).
-- =================================================================

INSERT INTO portail_droits (user_id, societe_id, app_id, role, actif)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'montebello',
  'projets-taches',
  'admin',
  true
)
ON CONFLICT DO NOTHING;

-- Vérification
SELECT u.prenom || ' ' || u.nom AS utilisateur, d.app_id, d.role, d.actif
FROM portail_droits d
JOIN portail_users u ON u.id = d.user_id
WHERE d.app_id = 'projets-taches';
