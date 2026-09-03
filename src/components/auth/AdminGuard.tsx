import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/**
 * Wraps admin routes. Redirects to sign-in if not authenticated,
 * or to home if authenticated but not an admin.
 */
export function AdminGuard() {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-streamly-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-streamly-purple border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default AdminGuard
