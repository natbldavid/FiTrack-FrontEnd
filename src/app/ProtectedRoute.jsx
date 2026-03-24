import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { ROUTES } from '../routes/routePaths'

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}

export default ProtectedRoute