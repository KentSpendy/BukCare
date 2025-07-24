import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'

interface Doctor {
  id: number
  email: string
  role: string
  specialization: string
  first_name: string
  last_name: string
  profile_photo: string
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/users/?role=doctor')
        setDoctors(res.data)
      } catch (err) {
        console.error('Error fetching doctors:', err)
      }
    }

    fetchDoctors()
  }, [])

  const filteredDoctors = doctors.filter((doc) => {
    const fullName = `${doc.first_name} ${doc.last_name}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Doctor List</h1>

      {/* 🔍 Search bar */}
      <input
        type="text"
        placeholder="Search by name or specialization"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full p-2 border border-gray-300 rounded"
      />

      {/* Doctor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="p-4 border rounded shadow hover:bg-blue-50 cursor-pointer transition"
            onClick={() => navigate(`/patient/doctor/${doc.id}`)} // 👈 Updated navigation
          >
            <img
              src={doc.profile_photo || '/default-profile.png'}
              alt={`Dr. ${doc.first_name} ${doc.last_name}`}
              className="w-16 h-16 rounded-full mb-2 object-cover"
            />
            <h1><strong>Dr. {doc.first_name} {doc.last_name}</strong></h1>
            <p className="text-sm text-gray-600">{doc.specialization}</p>
            <p className="text-xs text-gray-500">{doc.email}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
