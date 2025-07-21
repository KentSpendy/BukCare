import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Notification {
  id: number
  message: string
  is_read: boolean
  created_at: string
}

export default function DoctorNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/doctor/notifications/')
        setNotifications(res.data)
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
        setError('Unable to load notifications.')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    const interval = setInterval(fetchNotifications, 10000) // every 10 seconds

    return () => clearInterval(interval)
  }, [])
  

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [notifications])



  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Notification Log</h1>

        {loading && <p className="text-gray-600">Loading notifications...</p>}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && notifications.length === 0 ? (
          <p className="text-gray-500">You have no notifications yet.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`p-4 border rounded-lg shadow-sm ${
                  notif.is_read ? 'bg-white' : 'bg-yellow-50 border-yellow-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-gray-800">{notif.message}</p>
                  <span
                    className={`text-xs font-medium ml-4 ${
                      notif.is_read ? 'text-gray-400' : 'text-yellow-600'
                    }`}
                  >
                    {notif.is_read ? 'Read' : 'Unread'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {formatDateTime(notif.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
