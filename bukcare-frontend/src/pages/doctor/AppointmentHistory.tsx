import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Appointment {
  id: number
  patient_email: string
  status: string
  triage_status: string | null
  reason: string | null
  availability: {
    date: string
    start_time: string
    end_time: string
  }
}

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    try {
      const res = await api.get('/appointments/')
      const filtered = res.data.filter((appt: Appointment) =>
        ['cancelled', 'declined'].includes(appt.status) ||
        ['done', 'no_show'].includes(appt.triage_status || '')
      )
      setAppointments(filtered)
    } catch (err) {
      console.error('Failed to fetch history', err)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async () => {
    try {
      const res = await api.get('/doctor/export-appointments/', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'appointment_history.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Export failed', err)
      alert('Failed to export CSV.')
    }
  }

  const formatTime = (time: string) => {
    const [hour, min] = time.split(':')
    return `${hour}:${min}`
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Appointment History</h1>

      <button
        onClick={exportCSV}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        Export CSV
      </button>

      {loading ? (
        <p>Loading history...</p>
      ) : appointments.length === 0 ? (
        <p>No historical appointments.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white p-4 shadow rounded">
              <p><strong>Patient:</strong> {appt.patient_email || 'N/A'}</p>
              <p><strong>Date:</strong> {appt.availability.date}</p>
              <p>
                <strong>Time:</strong>{' '}
                {formatTime(appt.availability.start_time)} – {formatTime(appt.availability.end_time)}
              </p>
              <p><strong>Reason:</strong> {appt.reason || 'N/A'}</p>
              <p><strong>Status:</strong> {appt.status}</p>
              <p><strong>Triage:</strong> {appt.triage_status || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
