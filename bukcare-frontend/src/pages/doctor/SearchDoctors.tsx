import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
  specialization_verified: boolean
  profile_photo?: string
  is_available_on_call?: boolean
}

export default function SearchDoctors() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await api.get(`/public/doctors/?q=${query}`)
      setResults(res.data)
    } catch (err) {
      console.error('Failed to search doctors', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (query.length >= 2) {
      const timeout = setTimeout(() => {
        handleSearch()
      }, 500)
      return () => clearTimeout(timeout)
    } else {
      setResults([])
    }
  }, [query])

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Find a Doctor</h1>

      <input
        className="w-full border border-gray-300 rounded px-4 py-2 mb-6"
        placeholder="Search by name or specialization"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p>Searching...</p>}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((doc) => (
            <Link
              to={`/doctor/profile/${doc.id}`}
              key={doc.id}
              className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow hover:shadow-md transition"
            >
              <img
                src={doc.profile_photo || 'https://via.placeholder.com/80'}
                alt="Doctor"
                className="w-16 h-16 object-cover rounded-full border"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg">
                    Dr. {doc.first_name} {doc.last_name}
                  </p>
                  <span className={`text-sm font-medium ${doc.is_available_on_call ? 'text-green-600' : 'text-gray-400'}`}>
                    {doc.is_available_on_call ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{doc.specialization}</p>
                {doc.specialization_verified ? (
                  <span className="text-xs text-green-600">✅ Verified</span>
                ) : (
                  <span className="text-xs text-yellow-600">🕒 Awaiting Approval</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
