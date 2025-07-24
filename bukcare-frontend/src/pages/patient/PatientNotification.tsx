// src/pages/patient/PatientNotification.tsx
import { useEffect, useState } from 'react'
import api from '../../services/api'
import moment from 'moment'

interface Notification {
  id: number
  recipient: number
  message: string
  created_at: string
  is_read: boolean
}

export default function PatientNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/')
      setNotifications(res.data)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/`, { is_read: true })
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}/`)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Notifications</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">You have no notifications yet.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`border p-4 rounded shadow bg-white ${
                notification.is_read ? 'opacity-80' : 'bg-yellow-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="text-gray-800">{notification.message}</p>
                <span className="text-sm text-gray-500">
                  {moment(notification.created_at).fromNow()}
                </span>
              </div>

              <div className="mt-2 flex gap-3">
                {!notification.is_read && (
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => deleteNotification(notification.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
