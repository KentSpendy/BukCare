import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Appointment {
  id: number
  status: string
  reason: string
  created_at: string
  triage_status?: string
  patient_name?: string
  doctor_name?: string
  availability: {
    date: string
    start_time: string
    end_time: string
  }
}

export default function StaffDashboard() {
  const [filter, setFilter] = useState<string>('all')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

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

  const updateTriage = async (id: number, status: string) => {
    try {
      await api.patch(`/appointments/${id}/`, {
        triage_status: status
      })
      fetchAppointments()
    } catch (err) {
      console.error('Failed to update triage status', err)
      alert('Update failed')
    }
  }

  const formatTime = (time: string | undefined | null) => {
    if (!time || typeof time !== 'string') return 'N/A'
    const [hour, minute] = time.split(':')
    return `${hour}:${minute}`
  }


  <div className="flex gap-2 mb-4 flex-wrap">
  {['all', 'waiting', 'in_consultation', 'done', 'no_show'].map((status) => (
    <button
      key={status}
      onClick={() => setFilter(status)}
      className={`px-3 py-1 rounded ${
        filter === status
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } capitalize`}
    >
      {status.replace('_', ' ')}
    </button>
  ))}
</div>


  return (
    <div>
      <h1 className="text-xl font-bold mb-4">All Appointments</h1>

      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="p-4 border rounded shadow bg-white">
              <p><strong>Patient:</strong> {appt.patient_name || 'N/A'}</p>
              <p><strong>Doctor:</strong> {appt.doctor_name || 'N/A'}</p>
              <p><strong>Date:</strong> {appt.availability.date}</p>
              <p><strong>Time:</strong> {
                appt.availability
                  ? `${formatTime(appt.availability.start_time)} – ${formatTime(appt.availability.end_time)}`
                  : 'N/A'
              }</p>
              <p><strong>Status:</strong> <span className="capitalize">{appt.status}</span></p>
              <p><strong>Reason:</strong> {appt.reason || 'N/A'}</p>
              <p>
                <strong>Triage Status:</strong>{' '}
                <span className="capitalize font-semibold">
                  {appt.triage_status || 'N/A'}
                </span>
              </p>

              {appt.status === 'approved' && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => updateTriage(appt.id, 'waiting')}
                    className="bg-yellow-400 text-white px-3 py-1 rounded"
                  >
                    Waiting
                  </button>
                  <button
                    onClick={() => updateTriage(appt.id, 'in_consultation')}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    In Consultation
                  </button>
                  <button
                    onClick={() => updateTriage(appt.id, 'done')}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => updateTriage(appt.id, 'no_show')}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    No-show
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
