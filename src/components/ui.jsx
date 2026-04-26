// Design System — Projets et Tâches Montebello
// Aligné sur la charte Suite Montebello, déclinaison violet prune.

export const C = {
  // Couleurs identité
  prune:        '#5B3A5C',  // sidebar background
  pruneDark:    '#4A2E4B',  // hover / actif sidebar
  pruneLight:   '#7A5278',  // accents secondaires
  cta:          '#962828',  // CTA principaux Suite Montebello
  ctaDark:      '#7E1F1F',
  // Texte
  text:         '#0f172a',
  textMuted:    '#64748b',
  textLight:    '#94a3b8',
  // Surfaces
  bg:           '#f8fafc',
  card:         '#ffffff',
  border:       '#e2e8f0',
  borderLight:  '#f1f5f9',
  // Sémantique
  success:      '#10b981',
  warning:      '#f59e0b',
  danger:       '#ef4444',
  info:         '#3b82f6',
}

// ── Format français ────────────────────────────────────────────
export const fn = (n, decimals = 2) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export const fmtEuro = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

// ── Card ────────────────────────────────────────────────────────
export function Card({ children, style, ...rest }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: 16,
      ...style,
    }} {...rest}>
      {children}
    </div>
  )
}

// ── Stat card avec bordure gauche colorée (pattern Suite Montebello) ─
export function StatCard({ label, value, sub, accent = C.prune }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderLeft: `4px solid ${accent}`,
      borderRadius: 6,
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginTop: 4, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Pill badge (radius 99px) ────────────────────────────────────
export function Pill({ children, color = C.prune, bg }) {
  const background = bg || `${color}1a`
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      color,
      background,
      letterSpacing: '.02em',
    }}>
      {children}
    </span>
  )
}

// ── Section title ───────────────────────────────────────────────
export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>{children}</h2>
      {sub && <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ── Boutons ─────────────────────────────────────────────────────
export function BtnPrimary({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: C.cta,
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background .12s',
        ...(props.style || {}),
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = C.ctaDark }}
      onMouseOut={(e) => { e.currentTarget.style.background = C.cta }}
    >
      {children}
    </button>
  )
}

export function BtnSecondary({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: '#fff',
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'border-color .12s',
        ...(props.style || {}),
      }}
    >
      {children}
    </button>
  )
}

// ── Input ───────────────────────────────────────────────────────
export function Input({ style, ...rest }) {
  return (
    <input
      {...rest}
      style={{
        width: '100%',
        padding: '8px 12px',
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        fontSize: 13,
        outline: 'none',
        transition: 'border-color .12s',
        ...style,
      }}
    />
  )
}
