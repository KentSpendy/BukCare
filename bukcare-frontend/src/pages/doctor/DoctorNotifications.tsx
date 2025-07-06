import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Notification {
  id: number
  message: string
  is_read: boolean
  timestamp: string
}

export default function DoctorNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/doctor/notifications/')
      setNotifications(res.data)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notification Log</h1>

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map(n => (
            <li key={n.id} className="p-4 border rounded bg-white shadow">
              <p className={n.is_read ? 'text-gray-600' : 'text-blue-800 font-medium'}>
                {n.message}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(n.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
