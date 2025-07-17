import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Appointment {
  id: number
  status: string
  triage_status: string
  reason: string
  created_at: string
  patient_name?: string
  availability: {
    date: string
    start_time: string
    end_time: string
  }
}

export default function FakeQueue() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0] // format: YYYY-MM-DD

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/')
      const filtered = res.data.filter((appt: Appointment) =>
        appt.status === 'approved' &&
        appt.triage_status &&
        ['waiting', 'in_consultation'].includes(appt.triage_status) &&
        appt.availability?.date === today
      )
      setAppointments(filtered)
    } catch (err) {
      console.error('Error fetching queue appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const formatTime = (time: string | null | undefined) => {
    if (!time || typeof time !== 'string') return 'N/A'
    const [hour, minute] = time.split(':')
    return `${hour}:${minute}`
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Live Patient Queue (Today)</h1>

      {loading ? (
        <p>Loading...</p>
      ) : appointments.length === 0 ? (
        <p>No patients in queue otin.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt, idx) => (
            <div key={appt.id} className="p-4 border rounded shadow bg-white">
              <p><strong>{idx === 0 ? '🟢 Next:' : 'Patient:'}</strong> {appt.patient_name || 'Unknown'}</p>
              <p><strong>Time:</strong> {formatTime(appt.availability.start_time)} – {formatTime(appt.availability.end_time)}</p>
              <p><strong>Reason:</strong> {appt.reason || 'N/A'}</p>
              <p><strong>Triage:</strong> <span className="capitalize">{appt.triage_status}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
