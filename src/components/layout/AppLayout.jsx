import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth, can } from '@/lib/AuthContext'
import { C } from '@/components/ui'

const VERSION = '0.1.0'
const LOGO_SRC = '/logo.png'

const ROLE_LABELS = { membre: 'Membre', admin: 'Administrateur' }
const ROLE_COLORS = { membre: '#7A5278', admin: '#962828' }

// ── SVG Icons ─────────────────────────────────────────────────────
const IconMenu     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IconChevL    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,6 9,12 15,18"/></svg>
const IconDash     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
const IconKanban   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="6" height="14" rx="1"/><rect x="11" y="3" width="6" height="9" rx="1"/><rect x="19" y="3" width="2" height="6" rx="1"/></svg>
const IconList     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconInbox    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>
const IconCog      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>

const NAV = [
  { to: '/',           label: "Vue d'ensemble", icon: <IconDash/>,     exact: true, perm: 'view_dashboard' },
  { to: '/kanban',     label: 'Kanban',         icon: <IconKanban/>,   perm: 'view_projets' },
  { to: '/liste',      label: 'Liste',          icon: <IconList/>,     perm: 'view_projets' },
  { to: '/calendrier', label: 'Calendrier',     icon: <IconCalendar/>, perm: 'view_projets' },
  { to: '/factures',   label: 'Factures non affectées', icon: <IconInbox/>, perm: 'view_dashboard' },
  { to: '/admin',      label: 'Administration', icon: <IconCog/>,      perm: 'view_admin' },
]

export default function AppLayout() {
  const { profile, signOut } = useAuth()
  const role = profile?.role
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])

  const handleSignOut = async () => { await signOut(); navigate('/login') }

  const w = collapsed ? 62 : 252

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: w, minWidth: w, height: '100vh',
        background: C.prune,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'width .2s ease',
      }}>

        {/* En-tête */}
        <div style={{
          padding: collapsed ? '14px 12px' : '20px 18px 16px',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {collapsed ? (
            <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', padding: 4 }}>
              <IconMenu />
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 19, overflow: 'hidden', border: '2px solid rgba(255,255,255,.25)', flexShrink: 0, background: '#fff' }}>
                  <img src={LOGO_SRC} alt="Montebello" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '.03em' }}>Montebello</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.14em' }}>Projets et Tâches</div>
                </div>
              </div>
              <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', padding: 4 }} title="Réduire">
                <IconChevL />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '6px 4px' : '10px 8px 4px' }}>
          {NAV.filter(item => !item.perm || !role || can(role, item.perm)).map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              style={({ isActive }) => ({
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 10, padding: collapsed ? '9px 0' : '8px 14px',
                borderRadius: 7, border: 'none', textDecoration: 'none',
                background: isActive ? C.pruneDark : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,.6)',
                fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                transition: 'all .12s', marginBottom: 1, textAlign: 'left',
              })}
              title={collapsed ? item.label : ''}
            >
              {item.icon}
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* Pied : Date/Heure + Profil */}
        {!collapsed && (
          <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ textAlign: 'center', marginBottom: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.5)', letterSpacing: '.04em' }}>
                {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,.75)', letterSpacing: '.06em', marginTop: 2 }}>
                {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 13,
                background: ROLE_COLORS[profile?.role] || '#999',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 11, flexShrink: 0,
              }}>
                {profile?.nom?.[0] || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile ? `${profile.prenom} ${profile.nom}` : '—'}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.55)', fontWeight: 600 }}>
                  {ROLE_LABELS[profile?.role] || ''}
                </div>
              </div>
              <button onClick={handleSignOut} title="Déconnexion" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', padding: 2, fontSize: 14 }}>
                ⏻
              </button>
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.2)', textAlign: 'center' }}>
              V{VERSION} — Carrère — 97170 Petit-Bourg
            </div>
          </div>
        )}

        {collapsed && (
          <div style={{ padding: '8px 4px', borderTop: '1px solid rgba(255,255,255,.06)', textAlign: 'center' }}>
            <button onClick={handleSignOut} title="Déconnexion" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', padding: 4, fontSize: 14 }}>
              ⏻
            </button>
          </div>
        )}
      </div>

      {/* ── CONTENU PRINCIPAL ── */}
      <main style={{ flex: 1, overflowY: 'auto', background: C.bg, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}
