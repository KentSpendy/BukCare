import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Appointment {
  id: number
  reason: string
  status: string
  created_at: string
  availability: {
    date: string
    start_time: string
    end_time: string
  }
  doctor: number
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/')
      setAppointments(res.data)
    } catch (err) {
      console.error('Failed to fetch appointments:', err)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">My Appointments</h1>

      {appointments.length === 0 ? (
        <p>You have no appointments yet.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="p-4 border rounded shadow">
              <p><strong>Date:</strong> {appt.availability?.date || 'N/A'}</p>
              <p><strong>Time:</strong> {appt.availability?.start_time} – {appt.availability?.end_time}</p>
              <p><strong>Doctor ID:</strong> {appt.doctor}</p>
              <p><strong>Reason:</strong> {appt.reason}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 font-semibold ${appt.status === 'approved' ? 'text-green-600' : appt.status === 'declined' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {appt.status}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
