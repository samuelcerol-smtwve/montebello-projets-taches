import { useAuth } from '@/lib/AuthContext'
import { C, Card, StatCard, Pill, SectionTitle, BtnPrimary } from '@/components/ui'

export default function DashboardPage() {
  const { profile } = useAuth()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.text }}>
            Vue d'ensemble
          </h1>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            {profile ? `Bienvenue ${profile.prenom}` : 'Bienvenue'} — Pilotage des projets Montebello
          </div>
        </div>
        <BtnPrimary>+ Nouveau projet</BtnPrimary>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Projets actifs"        value="—" sub="Aucun projet" accent={C.prune} />
        <StatCard label="Projets en retard"     value="—" sub="—"            accent={C.danger} />
        <StatCard label="Mes tâches en cours"   value="—" sub="—"            accent={C.info} />
        <StatCard label="Budget total en cours" value="—" sub="—"            accent={C.warning} />
      </div>

      {/* Empty state */}
      <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 42, marginBottom: 12, opacity: .35 }}>📋</div>
        <SectionTitle sub="L'application est en cours de configuration. Le Sprint 0 est terminé : structure, charte, auth en place. Les fonctionnalités projets/tâches/budget arrivent au Sprint 1.">
          Sprint 0 — Setup terminé
        </SectionTitle>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <Pill color={C.success}>Layout opérationnel</Pill>
          <Pill color={C.success}>Auth Portail</Pill>
          <Pill color={C.success}>Charte violet prune</Pill>
          <Pill color={C.warning}>Tables pt_* à appliquer</Pill>
          <Pill color={C.warning}>Vercel à connecter</Pill>
        </div>
      </Card>
    </div>
  )
}
