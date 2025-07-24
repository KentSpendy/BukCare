import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Appointment {
  id: number
  reason: string
  status: string
  created_at: string
  availability_date: string
  availability_start_time: string
  availability_end_time: string
  doctor: {
    first_name: string
    last_name: string
    id: number
  }
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const handleCancel = async (id: number) => {
    try {
      await api.patch(`/appointments/${id}/`, { status: 'cancelled' })
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === id ? { ...appt, status: 'cancelled' } : appt
        )
      )
      alert('Appointment cancelled successfully.')
    } catch (err) {
      console.error('Cancel error:', err)
      alert('Failed to cancel appointment.')
    }
  }

  const isFutureDate = (dateStr: string) => {
    const today = new Date()
    const apptDate = new Date(dateStr)
    // Set time to 00:00 for accurate date-only comparison
    today.setHours(0, 0, 0, 0)
    apptDate.setHours(0, 0, 0, 0)
    return apptDate >= today
  }

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/')
      setAppointments(res.data)
    } catch (err) {
      console.error('Failed to fetch appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const upcomingAppointments = appointments.filter(
    (appt) =>
      ['pending', 'approved', 'rescheduled'].includes(appt.status) &&
      isFutureDate(appt.availability_date)
  )

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Appointments</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : upcomingAppointments.length === 0 ? (
        <p className="text-gray-500">You have no upcoming appointments.</p>
      ) : (
        <div className="space-y-4">
          {upcomingAppointments.map((appt) => (
            <div key={appt.id} className="border p-4 rounded shadow bg-white">
              <p>
                <strong>Doctor:</strong> Dr. {appt.doctor.first_name} {appt.doctor.last_name}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span
                  className={`font-medium ${
                    appt.status === 'cancelled'
                      ? 'text-red-500'
                      : appt.status === 'approved'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                </span>
              </p>
              <p>
                <strong>Date:</strong> {appt.availability_date}
              </p>
              <p>
                <strong>Time:</strong> {appt.availability_start_time} - {appt.availability_end_time}
              </p>

              {appt.status === 'pending' && (
                <button
                  disabled={appt.status !== 'pending'}
                  className={`mt-3 px-4 py-2 rounded ${
                    appt.status !== 'pending'
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  onClick={() => handleCancel(appt.id)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
