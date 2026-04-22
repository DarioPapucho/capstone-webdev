import { Navigate, useLocation } from 'react-router-dom'
import { useAppContext } from '../context/useAppContext'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser } = useAppContext()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
