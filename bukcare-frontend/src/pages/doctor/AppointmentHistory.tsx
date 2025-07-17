import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Appointment {
  id: number
  status: string
  triage_status?: string
  reason: string
  created_at: string
  availability_date: string
  availability_start_time: string
  availability_end_time: string
}

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [activeTab, setActiveTab] = useState('approved')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/appointments/history/')
        setAppointments(res.data)
      } catch (err) {
        console.error('Failed to fetch appointment history', err)
      }
    }

    fetchHistory()
  }, [])

  const filtered = appointments.filter((appt) => appt.status === activeTab)

  const downloadCSV = async () => {
    try {
      const res = await api.get('/appointments/export/', {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'appointments.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Failed to export appointments', err)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Appointment History</h1>

      <button
        onClick={downloadCSV}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700"
      >
        Export as CSV
      </button>

      <div className="flex gap-4 mb-4">
        {['approved', 'cancelled', 'declined'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1 rounded ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>No {activeTab} appointments found.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((appt) => (
            <li key={appt.id} className="bg-white p-4 rounded shadow">
              <p><strong>Date:</strong> {appt.availability_date}</p>
              <p><strong>Time:</strong> {appt.availability_start_time} – {appt.availability_end_time}</p>
              <p><strong>Status:</strong> {appt.status}</p>
              <p><strong>Reason:</strong> {appt.reason || 'N/A'}</p>
              <p><strong>Triage:</strong> {appt.triage_status || 'N/A'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
