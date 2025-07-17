import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Appointment {
  id: number
  reason: string
  triage_status?: string
  availability_date: string
  availability_start_time: string
  availability_end_time: string
  patient: number
  status: string
}

export default function DoctorQueue() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0] // e.g., '2025-07-15'

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments/')
        console.log("🔥 Raw Appointments:", res.data)
        setAppointments(res.data)
      } catch (err) {
        console.error('Failed to load appointments', err)
        setError('Unable to fetch appointments. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const todaysQueue = appointments
    .filter((appt) => {
      const apptDate = appt.availability_date
      const normalizedStatus = appt.status?.toLowerCase()
      console.log('🗓️ Comparing:', apptDate, '==', today)
      return normalizedStatus === 'approved' && apptDate === today
    })
    .sort((a, b) =>
      a.availability_start_time.localeCompare(b.availability_start_time)
    )

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return 'N/A'
    try {
      const [hourStr, minutes] = timeString.split(':')
      const hour = parseInt(hourStr)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return timeString
    }
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div style={{ padding: '2rem' }}>
      {loading && <p>Loading patient queue...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && todaysQueue.length === 0 && <p>No Patients in Queue</p>}
      {!loading && todaysQueue.length > 0 && (
        <div>
          <h2>🩺 Live Patient Queue - {getCurrentTime()}</h2>
          <p>Total Patients: {todaysQueue.length}</p>
          <p>Urgent Cases: {todaysQueue.filter(a => a.triage_status?.toLowerCase() === 'urgent').length}</p>
          <p>Low Priority: {todaysQueue.filter(a => a.triage_status?.toLowerCase() === 'low').length}</p>
          <p>Pending Triage: {todaysQueue.filter(a => !a.triage_status).length}</p>
          <ul style={{ marginTop: '2rem' }}>
            {todaysQueue.map((appt, index) => (
              <li key={appt.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
                <p><strong>#{index + 1} - Patient ID:</strong> {appt.patient}</p>
                <p><strong>Time:</strong> {formatTime(appt.availability_start_time)} – {formatTime(appt.availability_end_time)}</p>
                <p><strong>Reason:</strong> {appt.reason || 'No reason specified'}</p>
                <p><strong>Triage:</strong> {appt.triage_status || 'Pending'}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
