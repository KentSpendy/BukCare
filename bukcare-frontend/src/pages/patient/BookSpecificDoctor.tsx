import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function BookSpecificDoctor() {
  const { id } = useParams()
  const [availabilities, setAvailabilities] = useState<any[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/availabilities/')
        const filtered = res.data.filter((a: any) => a.doctor === parseInt(id || ''))
        setAvailabilities(filtered)
      } catch (err) {
        console.error(err)
      }
    }
    console.log('Filtered availabilities for doctor:', id, availabilities)
    fetch()
  }, [id])

  const handleBook = async () => {
    if (!selected) {
      alert('Please select a time slot.')
      return
    }

    const payload = {
      availability: selected,
      reason,
      status: 'pending'
    }

    console.log('Booking payload:', payload)

    try {
      await api.post('/appointments/', payload)
      alert('Appointment booked! Awaiting approval.')
    } catch (err: any) {
      console.error('Booking error:', err.response?.data || err.message)
      alert('Booking failed. Check console for details.')
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Book with Doctor #{id}</h1>

      <div className="space-y-2">
        {availabilities.map((slot) => (
          <div
            key={slot.id}
            className={`p-3 border rounded cursor-pointer ${
              selected === slot.id ? 'bg-blue-100' : ''
            }`}
            onClick={() => setSelected(slot.id)}
          >
            <p><strong>Date:</strong> {slot.date}</p>
            <p><strong>Time:</strong> {slot.start_time} - {slot.end_time}</p>
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
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleBook}
      >
        Book Appointment
      </button>
    </div>
  )
}
