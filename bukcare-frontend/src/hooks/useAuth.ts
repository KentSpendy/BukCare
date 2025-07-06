import { useEffect, useState } from 'react'
import api from '../services/api'

export default function useAuth() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      const token = localStorage.getItem('access')
      if (!token) {
        setRole(null)
        setLoading(false)
        return
      }

      try {
        const res = await api.get('/whoami/')
        setRole(res.data.role)
      } catch (err) {
        console.error('Failed to fetch role')
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [])

  return { role, loading }
}
