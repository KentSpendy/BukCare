// src/pages/patient/ViewDoctorProfile.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
  email: string
  profile_photo: string
  is_available_on_call?: boolean  // Optional
  contact_number: string
}

export default function ViewDoctorProfile() {
  const { id } = useParams<{ id: string }>()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/users/${id}/`)
        setDoctor(res.data)
      } catch (err) {
        console.error('Failed to fetch doctor', err)
        setError('Doctor not found.')
      }
    }

    fetchDoctor()
  }, [id])

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>
  }

  if (!doctor) {
    return <div className="text-gray-500 p-4 text-center">Loading doctor profile...</div>
  }

  return (
    <div className="max-w-lg mx-auto p-6 mt-10 bg-white shadow-md rounded-lg">
      <div className="flex flex-col items-center text-center">
        <img
          src={doctor.profile_photo || '/default-profile.png'}
          alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
          onError={(e) => (e.currentTarget.src = '/default-profile.png')}
          className="w-24 h-24 rounded-full object-cover mb-4 border border-gray-300"
        />

        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Dr. {doctor.first_name} {doctor.last_name}
        </h1>
        <p className="text-gray-600 mb-1">{doctor.specialization}</p>
        <p className="text-gray-500 mb-2">{doctor.email}</p>
        <p className="text-gray-500 mb-2">{doctor.contact_number}</p>

        {doctor.is_available_on_call && (
          <p className="text-green-600 font-medium mb-2">Available on Call</p>
        )}

        <button
          className="mt-3 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => navigate(`/patient/book/${doctor.id}`)}
        >
          Book Now
        </button>
      </div>
    </div>
  )
}
