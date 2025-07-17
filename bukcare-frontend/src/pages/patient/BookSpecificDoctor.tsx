import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Availability {
  id: number
  doctor: number
  date: string
  start_time: string
  end_time: string
}

export default function BookSpecificDoctor() {
  const { id } = useParams()
  const doctorId = parseInt(id || '', 10)
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const res = await api.get('/availabilities/')
        const filtered = res.data.filter((slot: Availability) => slot.doctor === doctorId)
        setAvailabilities(filtered)
      } catch (err) {
        console.error('Failed to fetch availabilities:', err)
      } finally {
        setLoading(false)
      }
    }

    if (doctorId) {
      fetchAvailabilities()
    }
  }, [doctorId])

    const handleBook = async () => {
    if (!selected) {
      alert('Please select a time slot.')
      return
    }

    try {
      await api.post('/appointments/', {
        availability_id: selected, // ✅ FIXED KEY
        reason: reason || '',
      })
      alert('Appointment booked successfully! Awaiting doctor approval.')
      setSelected(null)
      setReason('')
    } catch (err: any) {
      console.error('Booking error:', err.response?.data || err.message)
      alert('Booking failed. Please check the console for details.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Book with Doctor #{doctorId}</h1>

      {loading ? (
        <p>Loading available slots...</p>
      ) : availabilities.length === 0 ? (
        <p>No available slots for this doctor at the moment.</p>
      ) : (
        <>
          <div className="space-y-2">
            {availabilities.map((slot) => (
              <div
                key={slot.id}
                className={`p-3 border rounded cursor-pointer ${
                  selected === slot.id ? 'bg-blue-100 border-blue-400' : ''
                }`}
                onClick={() => setSelected(slot.id)}
              >
                <p><strong>Date:</strong> {slot.date}</p>
                <p><strong>Time:</strong> {slot.start_time} – {slot.end_time}</p>
              </div>
            ))}
          </div>

          <textarea
            className="border p-2 w-full mt-4 rounded"
            placeholder="Reason for appointment (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleBook}
          >
            Book Appointment
          </button>
        </>
      )}
    </div>
  )
}
