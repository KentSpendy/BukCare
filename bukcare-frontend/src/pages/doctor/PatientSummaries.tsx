import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Appointment {
  id: number
  date: string
  start_time: string
  end_time: string
  reason: string
  status: string
  triage_status: string | null
}

interface Patient {
  id: number
  email: string
  appointments: Appointment[]
}

export default function PatientSummaries() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/doctor/patient-summaries/')
        setPatients(res.data)
      } catch (err) {
        console.error('Failed to fetch summaries', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Patient Summaries</h1>
      {loading ? (
        <p>Loading...</p>
      ) : patients.length === 0 ? (
        <p>No patient summaries available.</p>
      ) : (
        <div className="space-y-6">
          {patients.map((patient) => (
            <div key={patient.id} className="bg-white shadow p-4 rounded">
              <h2 className="text-lg font-semibold mb-2">{patient.email}</h2>
              <div className="space-y-2">
                {patient.appointments.map((appt) => (
                  <div key={appt.id} className="border p-2 rounded">
                    <p><strong>Date:</strong> {appt.date}</p>
                    <p><strong>Time:</strong> {appt.start_time} – {appt.end_time}</p>
                    <p><strong>Reason:</strong> {appt.reason || 'N/A'}</p>
                    <p><strong>Status:</strong> {appt.status}</p>
                    <p><strong>Triage:</strong> {appt.triage_status || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
