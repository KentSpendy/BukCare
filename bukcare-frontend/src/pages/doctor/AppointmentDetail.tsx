import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'

interface Reschedule {
  previous_date: string
  previous_start_time: string
  previous_end_time: string
  changed_at: string
}

interface Appointment {
  id: number
  patient_name: string
  status: string
  triage_status: string
  reason: string
  availability: {
    date: string
    start_time: string
    end_time: string
  }
  reschedules: Reschedule[]
}

export default function AppointmentDetail() {
  const { id } = useParams()
  const [appt, setAppt] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/appointments/${id}/detail/`)
        setAppt(res.data)
      } catch (err) {
        console.error('Failed to load appointment detail', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [id])

  if (loading) return <p>Loading appointment detail...</p>
  if (!appt) return <p>Appointment not found.</p>

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Appointment Details</h2>
      <p><strong>Patient:</strong> {appt.patient_name}</p>
      <p><strong>Date:</strong> {appt.availability.date}</p>
      <p><strong>Time:</strong> {appt.availability.start_time} – {appt.availability.end_time}</p>
      <p><strong>Status:</strong> {appt.status}</p>
      <p><strong>Triage:</strong> {appt.triage_status || 'N/A'}</p>
      <p><strong>Reason:</strong> {appt.reason || 'N/A'}</p>

      {appt.reschedules.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Reschedule History:</h3>
          <ul className="list-disc ml-6 text-sm mt-2">
            {appt.reschedules.map((r, i) => (
              <li key={i}>
                {r.previous_date} from {r.previous_start_time} to {r.previous_end_time} (Changed on {new Date(r.changed_at).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
