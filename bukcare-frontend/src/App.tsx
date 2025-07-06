import { Routes, Route } from 'react-router-dom'
import Login from './auth/Login'
import Register from './auth/Register'

// Layout kada role
import DoctorLayout from './layouts/DoctorLayout'
import PatientLayout from './layouts/PatientLayout'
import StaffLayout from './layouts/StaffLayout'

// PAGE KADA ROLE
// Doctor
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorAvailability from './pages/doctor/Availability'
import DoctorQueue from './pages/doctor/Queue'
import DoctorProfile from './pages/doctor/DoctorProfile'

// Patient
import PatientDashboard from './pages/patient/Dashboard'
import DoctorList from './pages/patient/DoctorList'
import BookSpecificDoctor from './pages/patient/BookSpecificDoctor'
import MyAppointments from './pages/patient/MyAppointments'

// Staff
import StaffDashboard from './pages/staff/Dashboard'

// hooks and protected routes mother fucker
import ProtectedRoute from './routes/ProtectedRoute'
import useAuth from './hooks/useAuth'
import AppointmentDetail from './pages/doctor/AppointmentDetail'
import PatientSummaries from './pages/doctor/PatientSummaries'
import EditProfile from './pages/doctor/EditProfile'
import AppointmentHistory from './pages/doctor/AppointmentHistory'
import DoctorNotifications from './pages/doctor/DoctorNotifications'

function App() {
  const { role, loading } = useAuth()

  if (loading) return <p className="p-4">Loading user info...</p>

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Doctor Routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute role={role!} allowed={['doctor']}>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="availability" element={<DoctorAvailability />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="appointments/:id" element={<AppointmentDetail />} />
        <Route path="queue" element={<DoctorQueue />} />
        <Route path="patient-summaries" element={<PatientSummaries />} />
        <Route path="profile/:id" element={<DoctorProfile />} />
        <Route path="edit-profile" element={<EditProfile />} />
        <Route path="history" element={<AppointmentHistory />} />
        <Route path="notifications" element={<DoctorNotifications />} />
      </Route>


      {/* Patient Routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute role={role!} allowed={['patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="book" element={<DoctorList />} />
        <Route path="book/:id" element={<BookSpecificDoctor />} />
        <Route path="appointments" element={<MyAppointments />} />
      </Route>

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute role={role!} allowed={['staff']}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffDashboard />} />
      </Route>
    </Routes>
  )
}

export default App
