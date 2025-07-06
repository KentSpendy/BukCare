import { Link, Outlet } from 'react-router-dom'
import logout from '../utils/logout'

export default function StaffLayout() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Staff Dashboard</h1>
      <nav className="flex gap-4 mb-4">
        <Link to="">Home</Link>
        <Link to="triage">Triage</Link>
        <Link to="/staff">All Appointments</Link>
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
