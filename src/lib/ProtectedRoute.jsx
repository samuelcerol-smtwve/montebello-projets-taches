import { Navigate } from 'react-router-dom'
import { useAuth, can } from '@/lib/AuthContext'

export default function ProtectedRoute({ children, permission }) {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: 14, color: '#666' }}>
      Chargement...
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (permission && !can(profile?.role, permission)) return <Navigate to="/" replace />

  return children
}
