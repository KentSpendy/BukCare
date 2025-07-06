import { Link, Outlet } from 'react-router-dom'
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

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Doctor Dashboard</h1>
      <nav className="flex flex-wrap gap-4 mb-4">
        <Link to="">Home</Link>
        <Link to="appointments">Appointments</Link>
        <Link to="/doctor/availability">Availability</Link>
        <Link to="/doctor/queue">Live Queue</Link>
        <Link to="/doctor/patient-summaries">Patient Summaries</Link>
        <Link to="/doctor/edit-profile">Edit Profile</Link>
        <Link to="/doctor/history">Appointment History</Link>
        <Link to="/doctor/notifications">Notifications</Link>
        {user && (
          <Link
            to={`/doctor/profile/${user.id}`}
            className="text-blue-600 hover:underline"
          >
            My Profile
          </Link>
        )}
        <button
          onClick={logout}
          className="ml-auto text-red-600 hover:underline"
        >
          Logout
        </button>
      </nav>
      <Outlet />
    </div>
  )
}
