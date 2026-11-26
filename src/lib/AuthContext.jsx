import { createContext, useContext, useState, useEffect } from 'react'
import { lireSession, ecrireSession, majSession, effacerSession } from '../session.js'

// « Rester connecté » (PROJET Gaspard, 26/11/2026) : profil (id, nom, prénom, rôle, sans PIN) gardé dans le
// localStorage avec expiration (session.js) ; droit relu en base au chargement.
const CLE_SESSION = 'mb_projets_session'

const AuthContext = createContext(null)

const APP_ID = 'projets-taches'
const SOCIETE_ID = 'montebello'

const PERMISSIONS = {
  view_dashboard:        ['membre', 'admin'],
  view_projets:          ['membre', 'admin'],
  create_projet:         ['membre', 'admin'],
  edit_projet:           ['membre', 'admin'],
  delete_projet:         ['admin'],
  validate_depense:      ['admin'],
  manage_parametres:     ['admin'],
  approve_budget_excess: ['admin'],
  view_admin:            ['admin'],
}

export function can(role, action) {
  return PERMISSIONS[action] ? PERMISSIONS[action].includes(role) : false
}

const BASE_URL = import.meta.env.VITE_API_URL || 'https://jyuiazhduxizvvbosase.supabase.co/rest/v1'
const API_KEY  = import.meta.env.VITE_API_KEY  || ''

const HEADERS = {
  'Content-Type':  'application/json',
  'apikey':        API_KEY,
  'Authorization': `Bearer ${API_KEY}`,
  'Accept':        'application/json',
}

async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(pin)))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sbGet(table, params = '') {
  const res = await fetch(`${BASE_URL}/${table}?${params}`, { headers: HEADERS })
  if (!res.ok) throw new Error(`GET ${table} → ${res.status}`)
  return res.json()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { const p = lireSession(CLE_SESSION); return p ? { id: p.id } : null })
  const [profile, setProfile] = useState(() => lireSession(CLE_SESSION))
  const [loading, setLoading] = useState(false)
  const [portalUsers, setPortalUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const droits = await sbGet(
          'portail_droits',
          `societe_id=eq.${SOCIETE_ID}&app_id=eq.${APP_ID}&actif=eq.true&select=user_id,role`
        )
        if (!droits || !droits.length) { setUsersLoading(false); return }
        const ids = droits.map(d => d.user_id).join(',')
        const users = await sbGet(
          'portail_users',
          `id=in.(${ids})&actif=eq.true&select=id,nom,prenom,avatar`
        )
        const list = (users || []).map(u => {
          const droit = droits.find(d => d.user_id === u.id)
          return {
            id: u.id,
            nom: u.nom,
            prenom: u.prenom,
            avatar: u.avatar,
            fullName: `${u.prenom} ${u.nom}`.trim(),
            role: droit?.role || 'membre',
          }
        })
        setPortalUsers(list)
        // Session gardée : droit retiré -> déconnexion ; rôle mis à jour sinon.
        { const s = lireSession(CLE_SESSION); if (s && list.length) { const f = list.find(x => x.id === s.id); if (!f) { effacerSession(CLE_SESSION); setUser(null); setProfile(null) } else { const p = { ...s, role: f.role }; majSession(CLE_SESSION, p); setProfile(p) } } }
      } catch (e) {
        console.error('loadPortalUsers:', e)
      }
      setUsersLoading(false)
    }
    fetchUsers()
  }, [])

  async function signInPinForUser(userId, pin) {
    setLoading(true)
    try {
      const pin_hash = await hashPin(pin)
      const res = await sbGet(
        'portail_users',
        `id=eq.${userId}&pin_hash=eq.${pin_hash}&actif=eq.true&select=id`
      )
      if (!res || res.length === 0) {
        setLoading(false)
        return { error: { message: 'Code PIN incorrect' } }
      }
      const u = portalUsers.find(x => x.id === userId)
      if (!u) {
        setLoading(false)
        return { error: { message: 'Utilisateur introuvable' } }
      }
      const profileData = {
        id:      u.id,
        nom:     u.nom,
        prenom:  u.prenom,
        avatar:  u.avatar,
        role:    u.role,
        societe: SOCIETE_ID,
      }
      setUser({ id: u.id })
      setProfile(profileData); ecrireSession(CLE_SESSION, profileData)
      setLoading(false)
      return { error: null }
    } catch (e) {
      setLoading(false)
      return { error: { message: 'Erreur de connexion : ' + e.message } }
    }
  }

  async function signInPin(pin) {
    setLoading(true)
    try {
      const pin_hash = await hashPin(pin)
      const users = await sbGet(
        'portail_users',
        `pin_hash=eq.${pin_hash}&actif=eq.true&select=id,nom,prenom,avatar`
      )
      if (!users || users.length === 0) {
        setLoading(false)
        return { error: { message: 'Code PIN incorrect' } }
      }
      const u = users[0]
      const droits = await sbGet(
        'portail_droits',
        `user_id=eq.${u.id}&app_id=eq.${APP_ID}&actif=eq.true&select=role,societe_id`
      )
      if (!droits || droits.length === 0) {
        setLoading(false)
        return { error: { message: 'Accès non autorisé sur cette application' } }
      }
      const profileData = {
        id:      u.id,
        nom:     u.nom,
        prenom:  u.prenom,
        avatar:  u.avatar,
        role:    droits[0].role,
        societe: droits[0].societe_id,
      }
      setUser({ id: u.id })
      setProfile(profileData); ecrireSession(CLE_SESSION, profileData)
      setLoading(false)
      return { error: null }
    } catch (e) {
      setLoading(false)
      return { error: { message: 'Erreur de connexion : ' + e.message } }
    }
  }

  function signOut() {
    effacerSession(CLE_SESSION)
    setUser(null)
    setProfile(null)
  }

  const isAdmin  = profile?.role === 'admin'
  const isMembre = !!profile?.role

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      portalUsers, usersLoading,
      signInPin, signInPinForUser, signOut,
      isAdmin, isMembre,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
