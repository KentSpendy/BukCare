// src/pages/doctor/DoctorNotifications.tsx
import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Notification {
  id: number
  message: string
  created_at: string
  is_read: boolean
}

export default function DoctorNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get('/doctor/notifications/')
        setNotifications(res.data)
      } catch (err) {
        console.error('Failed to load notifications', err)
        setError('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getNotificationIcon = (message: string) => {
    if (message.toLowerCase().includes('appointment')) {
      return (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    } else if (message.toLowerCase().includes('patient')) {
      return (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    } else if (message.toLowerCase().includes('emergency') || message.toLowerCase().includes('urgent')) {
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    } else {
      return (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  const getPriorityColor = (message: string) => {
    if (message.toLowerCase().includes('emergency') || message.toLowerCase().includes('urgent')) {
      return 'border-l-red-500 bg-red-50'
    } else if (message.toLowerCase().includes('appointment')) {
      return 'border-l-blue-500 bg-blue-50'
    } else if (message.toLowerCase().includes('patient')) {
      return 'border-l-green-500 bg-green-50'
    } else {
      return 'border-l-purple-500 bg-purple-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 sm:px-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-7.5-7.5H12a7.5 7.5 0 017.5 7.5v5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
                  <p className="text-blue-100 mt-1">Stay updated with your latest alerts</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-gray-600 font-medium">Loading notifications...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 sm:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-7.5-7.5H12a7.5 7.5 0 017.5 7.5v5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
                  <p className="text-blue-100 mt-1">Stay updated with your latest alerts</p>
                </div>
              </div>
              
              {/* Notification Badge */}
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-white font-semibold text-sm">
                  {notifications.length} {notifications.length === 1 ? 'Alert' : 'Alerts'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-7.5-7.5H12a7.5 7.5 0 017.5 7.5v5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Notifications</h3>
                <p className="text-gray-600">You're all caught up! No new alerts at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((note) => (
                  <div
                    key={note.id}
                    className={`relative bg-white border-l-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${getPriorityColor(note.message)}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(note.message)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className="text-gray-800 font-medium leading-relaxed">
                              {note.message}
                            </p>
                            
                            {/* Read Status */}
                            {!note.is_read && (
                              <div className="flex-shrink-0 ml-4">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Timestamp */}
                          <div className="mt-2 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-500 font-medium">
                              {formatDate(note.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Subtle gradient overlay for visual depth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/20 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {notifications.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                <div className="text-xs text-gray-500 mt-1">Total Alerts</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.is_read).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Read</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {notifications.filter(n => !n.is_read).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Unread</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => 
                    n.message.toLowerCase().includes('urgent') || 
                    n.message.toLowerCase().includes('emergency')
                  ).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Priority</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}