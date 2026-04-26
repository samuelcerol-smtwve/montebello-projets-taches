import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { C } from '@/components/ui'

const ROLE_COLORS = { membre: '#7A5278', admin: '#962828' }
const ROLE_LABELS = { membre: 'Membre', admin: 'Administrateur' }

const BG_GRADIENT = 'linear-gradient(135deg, #4A2E4B 0%, #5B3A5C 100%)'

export default function LoginPage() {
  const { portalUsers, usersLoading, signInPinForUser } = useAuth()
  const navigate = useNavigate()
  const [sel, setSel] = useState('')
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')

  const addDigit = d => {
    if (pin.length < 4) {
      const np = pin + d
      setPin(np)
      if (np.length === 4) {
        const u = portalUsers.find(x => x.id === sel)
        if (u) {
          signInPinForUser(u.id, np).then(result => {
            if (!result.error) { setErr(''); navigate('/') }
            else { setErr('Code PIN incorrect'); setTimeout(() => { setPin(''); setErr('') }, 1200) }
          })
        }
      }
    }
  }
  const delDigit = () => setPin(p => p.slice(0, -1))

  if (usersLoading) return (
    <div style={{ minHeight: '100vh', background: BG_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.7)' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Chargement…</div>
      </div>
    </div>
  )

  if (!portalUsers.length) return (
    <div style={{ minHeight: '100vh', background: BG_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', maxWidth: 380, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,.25)' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.prune, marginBottom: 8 }}>Aucun accès configuré</div>
        <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
          Aucun utilisateur n'a encore de droit sur l'application <b>Projets et Tâches</b>.
          Samuel Cerol doit ajouter les droits depuis l'administration du Portail Montebello.
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG_GRADIENT, padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,.25)' }}>
        <img src="/logo.png" alt="Montebello" style={{ width: 56, height: 56, borderRadius: 28, objectFit: 'cover', marginBottom: 12 }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: C.prune, marginBottom: 2 }}>Montebello</div>
        <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 600 }}>
          Projets et Tâches
        </div>

        {!sel ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>Qui êtes-vous ?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {portalUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSel(u.id)}
                  style={{
                    padding: '12px 16px', borderRadius: 10,
                    border: `1.5px solid ${C.border}`,
                    background: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                    transition: 'border-color .12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.prune}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 16,
                    background: ROLE_COLORS[u.role] || '#999',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 13,
                  }}>
                    {u.fullName[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{u.fullName}</div>
                    <div style={{ fontSize: 10, color: ROLE_COLORS[u.role], fontWeight: 600 }}>
                      {ROLE_LABELS[u.role] || u.role}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => { setSel(''); setPin(''); setErr('') }}
              style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 11, marginBottom: 8 }}
            >
              ← Changer
            </button>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>
              {portalUsers.find(u => u.id === sel)?.fullName}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    width: 16, height: 16, borderRadius: 8,
                    background: pin.length > i ? C.prune : '#e0e0e0',
                    transition: 'all .15s',
                  }}
                />
              ))}
            </div>
            {err && <div style={{ fontSize: 12, color: C.danger, fontWeight: 600, marginBottom: 10 }}>{err}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, maxWidth: 220, margin: '0 auto' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, '⌫'].map((d, i) => (
                <button
                  key={i}
                  onClick={() => { if (d === '⌫') delDigit(); else if (d !== null) addDigit(String(d)) }}
                  style={{
                    padding: '14px 0', borderRadius: 10,
                    border: `1px solid ${d === null ? 'transparent' : C.border}`,
                    background: d === null ? 'transparent' : '#fafafa',
                    cursor: d === null ? 'default' : 'pointer',
                    fontSize: 18, fontWeight: 700,
                    color: d === '⌫' ? C.textMuted : C.text,
                    visibility: d === null ? 'hidden' : 'visible',
                  }}
                  onMouseEnter={e => { if (d !== null) e.currentTarget.style.background = '#f0f0f0' }}
                  onMouseLeave={e => { if (d !== null) e.currentTarget.style.background = '#fafafa' }}
                >
                  {d}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
