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
  const [triageStatus, setTriageStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/appointments/${id}/detail/`)
        setAppt(res.data)
        setTriageStatus(res.data.triage_status || '')
      } catch (err) {
        console.error('Failed to load appointment detail', err)
      }
    }

    fetchDetail()
  }, [id])

  const handleTriageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTriageStatus(e.target.value)
  }

  const saveTriageStatus = async () => {
    if (!appt) return
    try {
      setSaving(true)
      await api.patch(`/appointments/${appt.id}/`, {
        triage_status: triageStatus || null,
      })
      const updated = await api.get(`/appointments/${appt.id}/detail/`)
      setAppt(updated.data)
    } catch (err) {
      console.error('Failed to update triage status', err)
    } finally {
      setSaving(false)
    }
  }

  if (!appt) return <p>Loading appointment details...</p>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Appointment Details</h2>

      <div className="space-y-2 text-sm">
        <p><strong>Patient:</strong> {appt.patient_name}</p>
        <p><strong>Date:</strong> {appt.availability.date}</p>
        <p><strong>Time:</strong> {appt.availability.start_time} – {appt.availability.end_time}</p>
        <p><strong>Status:</strong> <span className="capitalize">{appt.status}</span></p>
        <p><strong>Reason for Visit:</strong> {appt.reason || 'N/A'}</p>
        <p>
          <strong>Triage Status:</strong>{' '}
          <span className={`font-semibold ${appt.triage_status === 'urgent' ? 'text-red-600' : appt.triage_status === 'non_urgent' ? 'text-green-600' : 'text-gray-500'}`}>
            {appt.triage_status ? appt.triage_status.replace('_', ' ') : 'Not set'}
          </span>
        </p>
      </div>

      {/* TRIAGE FORM */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-1">Update Triage Status:</label>
        <div className="flex gap-3 items-center">
          <select
            value={triageStatus}
            onChange={handleTriageChange}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">-- Select --</option>
            <option value="urgent">Urgent</option>
            <option value="non_urgent">Non-Urgent</option>
          </select>
          <button
            className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            onClick={saveTriageStatus}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* RESCHEDULE HISTORY */}
      {appt.reschedules.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Reschedule History:</h3>
          <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
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
