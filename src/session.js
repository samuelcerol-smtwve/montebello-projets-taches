// ============================================================
//  session.js — « Rester connecté » (Suite Montebello)
//  PROJET Gaspard (Informatique & Développement), 26/11/2026.
//  Même fichier dans chaque application de la Suite.
//
//  Avant : l'utilisateur connecté par code PIN n'était gardé qu'en mémoire,
//  donc chaque rafraîchissement de la page redemandait le code.
//  Maintenant : la session est gardée dans le localStorage du navigateur
//  (pas sessionStorage : elle survit au rafraîchissement et à la fermeture
//  de l'onglet), avec une date d'expiration.
//
//  Durée : 12 heures par défaut (une journée de travail), réglable par la
//  variable VITE_SESSION_HEURES du projet Vercel (ex. 168 = 7 jours),
//  plafonnée à 7 jours. « Se déconnecter » efface la session tout de suite.
//
//  Sécurité : rien de secret n'est stocké (ni code PIN, ni empreinte du PIN,
//  ni clé) : seulement l'identité affichée, le rôle et l'heure d'expiration.
//  Au chargement, chaque appli relit les droits en base : un droit retiré
//  dans le Portail ferme la session au prochain rafraîchissement.
// ============================================================

const HEURES_MAX = 168
const HEURES = Math.min(Math.max(Number(import.meta.env.VITE_SESSION_HEURES) || 12, 1), HEURES_MAX)
const VERSION = 1

function stockage() {
  try { return window.localStorage } catch { return null }
}

/** Lit la session ; renvoie les données enregistrées, ou null si absente, expirée ou illisible. */
export function lireSession(cle) {
  const ls = stockage()
  if (!ls) return null
  try {
    const brut = ls.getItem(cle)
    if (!brut) return null
    const s = JSON.parse(brut)
    if (!s || s.v !== VERSION || !s.donnees || typeof s.expire !== 'number' || Date.now() >= s.expire) {
      ls.removeItem(cle)
      return null
    }
    return s.donnees
  } catch {
    try { ls.removeItem(cle) } catch { /* rien */ }
    return null
  }
}

/** Ouvre (ou prolonge) la session pour la durée configurée. */
export function ecrireSession(cle, donnees) {
  const ls = stockage()
  if (!ls) return
  try {
    ls.setItem(cle, JSON.stringify({ v: VERSION, donnees, ouverte: Date.now(), expire: Date.now() + HEURES * 3600 * 1000 }))
  } catch { /* stockage plein ou bloqué : la session reste en mémoire seulement */ }
}

/** Met à jour les données sans changer l'heure d'expiration. */
export function majSession(cle, donnees) {
  const ls = stockage()
  if (!ls) return
  try {
    const s = JSON.parse(ls.getItem(cle) || 'null')
    if (s && s.v === VERSION && Date.now() < s.expire) ls.setItem(cle, JSON.stringify({ ...s, donnees }))
  } catch { /* rien */ }
}

/** Ferme la session (bouton « Se déconnecter », droit retiré). */
export function effacerSession(cle) {
  const ls = stockage()
  if (!ls) return
  try { ls.removeItem(cle) } catch { /* rien */ }
}

export const DUREE_SESSION_HEURES = HEURES
