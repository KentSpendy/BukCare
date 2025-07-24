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

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/')
      setAppointments(res.data)
    } catch (err) {
      console.error('Failed to fetch appointment history:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const isPastDate = (dateStr: string) => {
    const today = new Date()
    const apptDate = new Date(dateStr)
    today.setHours(0, 0, 0, 0)
    apptDate.setHours(0, 0, 0, 0)
    return apptDate < today
  }

  const filteredAppointments = appointments.filter(
    (appt) =>
      ['cancelled', 'declined', 'completed', 'no_show'].includes(appt.status) ||
      (['approved', 'rescheduled'].includes(appt.status) && isPastDate(appt.availability_date))
  )

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Appointment History</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filteredAppointments.length === 0 ? (
        <p className="text-gray-500">You have no past appointments yet.</p>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => (
            <div key={appt.id} className="border p-4 rounded shadow bg-white">
              <p>
                <strong>Doctor:</strong>{' '}
                {appt.doctor
                  ? `Dr. ${appt.doctor.first_name} ${appt.doctor.last_name}`
                  : 'N/A'}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span
                  className={`font-medium ${
                    ['cancelled', 'declined'].includes(appt.status)
                      ? 'text-red-500'
                      : appt.status === 'no_show'
                      ? 'text-yellow-600'
                      : 'text-gray-600'
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
              <p>
                <strong>Reason:</strong> {appt.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
