import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Appointment {
  id: number
  status: string
  triage_status?: string
  reason: string
  created_at: string
  availability: {
    date: string
    start_time: string
    end_time: string
  }
}

interface Availability {
  id: number
  date: string
  start_time: string
  end_time: string
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const today = new Date().toISOString().split('T')[0]

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/')
      setAppointments(res.data)
    } catch (err) {
      console.error('Failed to fetch appointments', err)
    }
  }

  const fetchAvailabilities = async () => {
    try {
      const res = await api.get('/availabilities/')
      setAvailabilities(res.data)
    } catch (err) {
      console.error('Failed to fetch availabilities', err)
    }
  }

  useEffect(() => {
    fetchAppointments()
    fetchAvailabilities()
  }, [])

  const todaysAppointments = appointments.filter(
    (appt) =>
      appt.status === 'approved' &&
      appt.availability?.date === today
  )

  const newRequests = appointments.filter(
    (appt) => appt.status === 'pending'
  )

  const upcomingSlots = availabilities.filter(
    (slot) => slot.date > today
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Doctor Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Today's Appointments</h2>
          <p className="text-3xl font-bold text-blue-900">{todaysAppointments.length}</p>
        </div>

        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Upcoming Slots</h2>
          <p className="text-3xl font-bold text-green-900">{upcomingSlots.length}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">New Requests</h2>
          <p className="text-3xl font-bold text-yellow-900">{newRequests.length}</p>
        </div>
      </div>

      {/* Optional: Preview upcoming slots or today's queue here */}
    </div>
  )
}
