import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

interface Appointment {
  id: number
  status: string
  reason: string
  patient_name?: string
  availability: {
    date: string
    start_time: string
    end_time: string
  }
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/')
      setAppointments(res.data)
    } catch (err) {
      console.error('Failed to load appointments', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.patch(`/appointments/${id}/`, { status })
      fetchAppointments()
    } catch (err) {
      console.error('Failed to update appointment', err)
    }
  }

  const formatTime = (time: string) => {
    if (!time) return 'N/A'
    const [hour, min] = time.split(':')
    return `${hour}:${min}`
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Appointments</h1>

      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="p-4 border rounded shadow bg-white">
              <p><strong>Patient:</strong> {appt.patient_name || 'N/A'}</p>
              <p><strong>Date:</strong> {appt.availability?.date}</p>
              <p><strong>Time:</strong> {formatTime(appt.availability?.start_time)} – {formatTime(appt.availability?.end_time)}</p>
              <p><strong>Reason:</strong> {appt.reason || 'N/A'}</p>
              <p><strong>Status:</strong> <span className="capitalize">{appt.status}</span></p>

              <div className="flex gap-2 mt-3 flex-wrap">
                <Link
                  to={`/doctor/appointments/${appt.id}`}
                  className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                >
                  View Details
                </Link>

                {appt.status === 'pending' && (
                  <>
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() => handleStatusUpdate(appt.id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => handleStatusUpdate(appt.id, 'rejected')}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
