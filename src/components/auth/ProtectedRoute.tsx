import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type ProtectedRouteProps = {
  role: 'student' | 'responsavel'
}

export default function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { user, loading, isResponsavel } = useAuth()

  if (loading) {
    return <main className="page-shell">Carregando...</main>
  }

  if (!user) {
    return (
      <Navigate
        to={role === 'responsavel' ? '/responsavel' : '/entrar'}
        replace
      />
    )
  }

  if (role === 'responsavel' && !isResponsavel) {
    return <Navigate to="/" replace />
  }

  if (role === 'student' && isResponsavel) {
    return <Navigate to="/painel-responsavel" replace />
  }

  return <Outlet />
}
