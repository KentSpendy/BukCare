import type { JSX } from 'react'
import { Navigate } from 'react-router-dom'

interface Props {
  role: string
  allowed: string[]
  children: JSX.Element
}

export default function ProtectedRoute({ role, allowed, children }: Props) {
  if (!allowed.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}
