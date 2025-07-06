import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Availability {
  id: number
  doctor: number
  date: string
  start_time: string
  end_time: string
}

export default function BookAppointment() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const res = await api.get('/availabilities/')
        setAvailabilities(res.data)
      } catch (err) {
        console.error('Error fetching availabilities:', err)
      }
    }

    fetchAvailabilities()
  }, [])

  const handleBook = async () => {
    if (!selected) return alert('Please select a time slot.')

    try {
      const availability = availabilities.find(a => a.id === selected)
      await api.post('/appointments/', {
        patient: null, // backend will assign from token
        doctor: availability?.doctor,
        availability: availability?.id,
        reason,
        status: 'pending'
      })
      alert('Appointment booked! Awaiting approval.')
    } catch (err) {
      alert('Booking failed.')
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Book an Appointment</h1>

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
            <p><strong>Doctor ID:</strong> {slot.doctor}</p>
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
        Book Now
      </button>
    </div>
  )
}
