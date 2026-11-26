import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/lib/AuthContext'
import ProtectedRoute from '@/lib/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/modules/dashboard/DashboardPage'

// Bypass auth en dev seulement (26/11/2026, Gaspard) : il valait `true` en dur, donc
// l'application en ligne s'ouvrait SANS code PIN. Désormais uniquement avec `npm run dev`.
const DEV_BYPASS = import.meta.env.DEV === true

const Placeholder = ({ titre }) => (
  <div>
    <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#0f172a' }}>{titre}</h1>
    <p style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>
      Cette section sera implémentée dans un prochain sprint.
    </p>
  </div>
)

export default function App() {
  if (DEV_BYPASS) {
    return (
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="kanban"     element={<Placeholder titre="Kanban" />} />
              <Route path="liste"      element={<Placeholder titre="Liste des projets" />} />
              <Route path="calendrier" element={<Placeholder titre="Calendrier" />} />
              <Route path="factures"   element={<Placeholder titre="Factures non affectées" />} />
              <Route path="admin"      element={<Placeholder titre="Administration" />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="kanban"     element={<ProtectedRoute permission="view_projets"><Placeholder titre="Kanban" /></ProtectedRoute>} />
            <Route path="liste"      element={<ProtectedRoute permission="view_projets"><Placeholder titre="Liste des projets" /></ProtectedRoute>} />
            <Route path="calendrier" element={<ProtectedRoute permission="view_projets"><Placeholder titre="Calendrier" /></ProtectedRoute>} />
            <Route path="factures"   element={<ProtectedRoute permission="view_dashboard"><Placeholder titre="Factures non affectées" /></ProtectedRoute>} />
            <Route path="admin"      element={<ProtectedRoute permission="view_admin"><Placeholder titre="Administration" /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
