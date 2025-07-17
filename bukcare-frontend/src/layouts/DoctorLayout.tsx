import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'
import logout from '../utils/logout'

interface UserInfo {
  id: number
  email: string
  role: string
}

export default function DoctorLayout() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/whoami/')
        setUser(res.data)
      } catch (err) {
        console.error('Failed to fetch user info', err)
      }
    }

    fetchUser()
  }, [])

  const navigationItems = [
    { to: '', label: 'Dashboard', icon: '🏠' },
    { to: 'appointments', label: 'Appointments', icon: '📅' },
    { to: '/doctor/availability', label: 'Availability', icon: '⏰' },
    { to: '/doctor/queue', label: 'Live Queue', icon: '👥' },
    { to: '/doctor/patient-summaries', label: 'Patient Summaries', icon: '📋' },
    { to: '/doctor/edit-profile', label: 'Edit Profile', icon: '✏️' },
    { to: '/doctor/history', label: 'Appointment History', icon: '📜' },
    { to: '/doctor/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/search-doctors', label: 'Find Doctors', icon: '🔍' },
  ]

  const isActiveRoute = (path: string) => {
    if (path === '') return location.pathname === '/doctor' || location.pathname === '/doctor/'
    return location.pathname.includes(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">
              🏥 Doctor Portal
            </h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
          {user && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-medium text-gray-800 truncate">{user.email}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActiveRoute(item.to)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          
          {user && (
            <Link
              to={`/doctor/profile/${user.id}`}
              className={`
                flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActiveRoute(`/doctor/profile/${user.id}`)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="text-lg mr-3">👤</span>
              My Profile
            </Link>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <span className="text-lg mr-3">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Doctor Dashboard</h1>
            <div className="w-10" /> {/* Spacer for balance */}
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}