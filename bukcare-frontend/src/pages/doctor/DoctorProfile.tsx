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
  is_available_on_call: boolean
}

export default function DoctorProfile() {
  const { id } = useParams()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctor/profile/${id}/`)
        setDoctor(res.data)
      } catch (err) {
        console.error('Failed to fetch doctor profile', err)
        setError('Failed to load doctor profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor profile...</p>
        </div>
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">👨‍⚕️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The doctor profile you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-800 h-32"></div>
        <div className="relative px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
            {/* Profile Photo */}
            <div className="relative -mt-16 mb-4 md:mb-0">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                {doctor.profile_photo ? (
                  <img
                    src={doctor.profile_photo}
                    alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white text-4xl font-bold">
                    {doctor.first_name.charAt(0)}{doctor.last_name.charAt(0)}
                  </div>
                )}
              </div>
              {/* Online Status Indicator */}
              <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${
                doctor.is_available_on_call ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                <div className={`w-full h-full rounded-full ${
                  doctor.is_available_on_call ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dr. {doctor.first_name} {doctor.last_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  👨‍⚕️ Medical Doctor
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  doctor.is_available_on_call 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {doctor.is_available_on_call ? '🟢 Available on Call' : '⚫ Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specialization Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Specialization
            </h2>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              doctor.specialization_verified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {doctor.specialization_verified ? '✅ Verified' : '⏳ Pending Verification'}
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Primary Specialization</p>
              <p className="font-medium text-gray-900">
                {doctor.specialization || 'General Practice'}
              </p>
            </div>
            {doctor.specialization_verified && (
              <div className="flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Credentials verified by medical board
              </div>
            )}
          </div>
        </div>

        {/* Availability Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Availability Status
          </h2>
          <div className="space-y-3">
            <div className={`p-4 rounded-lg border-2 ${
              doctor.is_available_on_call 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    doctor.is_available_on_call ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="font-medium">
                    {doctor.is_available_on_call ? 'Available for Emergency Calls' : 'Currently Offline'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {doctor.is_available_on_call 
                  ? 'This doctor is currently available for urgent consultations and emergency calls.'
                  : 'This doctor is currently offline. Please check their scheduled availability or try again later.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Professional Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Doctor ID</h3>
            <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded-lg">2025{doctor.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Full Name</h3>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {doctor.first_name} {doctor.last_name}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-blue-700 font-medium"
            disabled={!doctor.is_available_on_call}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {doctor.is_available_on_call ? 'Call Now' : 'Call Unavailable'}
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-green-700 font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Appointment
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-purple-700 font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Send Message
          </button>
        </div>
      </div>
    </div>
  )
}