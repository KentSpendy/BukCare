import { Link, Outlet } from 'react-router-dom'
import logout from '../utils/logout'

export default function PatientLayout() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Patient Dashboard</h1>
      <nav className="flex gap-4 mb-4 items-center">
        <Link to="/patient">Home</Link>
        <Link to="/patient/book">Book Appointment</Link>
        <Link to="/patient/appointments">My Appointments</Link>
        <button
          onClick={logout}
          className="ml-auto text-red-600 hover:underline"
        >
          Logout
        </button>
      </nav>

      {/* Child page ni diri */}
      <Outlet />
    </div>
  )
}
