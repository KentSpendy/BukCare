import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'

interface Doctor {
  id: number
  email: string
  role: string
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
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

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Available Doctors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="p-4 border rounded shadow hover:bg-blue-100 cursor-pointer"
            onClick={() => navigate(`/patient/book/${doc.id}`)}
          >
            <p><strong>Email:</strong> {doc.email}</p>
            <p><strong>Role:</strong> {doc.role}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
