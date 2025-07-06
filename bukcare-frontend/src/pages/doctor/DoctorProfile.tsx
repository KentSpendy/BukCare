import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'

interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
  specialization_verified: boolean
  profile_photo?: string
}

export default function DoctorProfile() {
  const { id } = useParams()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctor/profile/${id}/`)
        setDoctor(res.data)
      } catch (err) {
        console.error('Failed to fetch doctor profile', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [id])

  if (loading) return <p className="text-center text-gray-500">Loading profile...</p>
  if (!doctor) return <p className="text-center text-red-500">Doctor not found.</p>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-md">
      <div className="flex items-center gap-6 mb-6">
        <img
          src={doctor.profile_photo || '/default-avatar.png'}
          alt="Doctor Profile"
          className="w-32 h-32 object-cover rounded-full border shadow"
        />
        <div>
          <h1 className="text-3xl font-bold">
            Dr. {doctor.first_name} {doctor.last_name}
          </h1>
          <p className="text-gray-600 mt-1">Doctor Profile</p>
        </div>
      </div>

      <div className="space-y-2">
        <p>
          <strong>Specialization:</strong>{' '}
          <span>{doctor.specialization || 'N/A'}</span>
        </p>
        <p>
          <strong>Status:</strong>{' '}
          <span className={doctor.specialization_verified ? 'text-green-600' : 'text-yellow-600'}>
            {doctor.specialization_verified ? 'Verified' : 'Unverified'}
          </span>
        </p>
      </div>
    </div>
  )
}
