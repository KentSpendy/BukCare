import { useEffect, useState } from 'react'
import { Clock, Users, AlertTriangle, UserCheck, User } from 'lucide-react'

import api from '../../services/api'

interface Appointment {
  id: number
  reason: string
  triage_status?: string
  availability_date: string
  availability_start_time: string
  availability_end_time: string
  patient: number
  status: string
}

export default function DoctorQueue() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments/')
        console.log("🔥 Raw Appointments:", res.data)
        setAppointments(res.data)
      } catch (err) {
        console.error('Failed to load appointments', err)
        setError('Unable to fetch appointments. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const todaysQueue = appointments
    .filter((appt) => {
      const apptDate = appt.availability_date
      const normalizedStatus = appt.status?.toLowerCase()
      console.log('🗓️ Comparing:', apptDate, '==', today)
      return normalizedStatus === 'approved' && apptDate === today
    })
    .sort((a, b) =>
      a.availability_start_time.localeCompare(b.availability_start_time)
    )

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return 'N/A'
    try {
      const [hourStr, minutes] = timeString.split(':')
      const hour = parseInt(hourStr)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return timeString
    }
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getTriageBadge = (status: string | undefined) => {
    if (!status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          <User className="w-3 h-3 mr-1" />
          Pending Triage
        </span>
      )
    }
    
    const normalizedStatus = status.toLowerCase()
    if (normalizedStatus === 'urgent') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Urgent
        </span>
      )
    }
    
    if (normalizedStatus === 'low') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <UserCheck className="w-3 h-3 mr-1" />
          Low Priority
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <User className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading patient queue...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Queue</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-7 h-7 text-blue-600 mr-3" />
                Patient Queue
              </h1>
              <p className="text-gray-600 mt-1">Today's appointments overview</p>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-mono text-lg">{getCurrentTime()}</span>
            </div>
          </div>
        </div>

        {todaysQueue.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Patients in Queue</h3>
            <p className="text-gray-500">There are no scheduled appointments for today.</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{todaysQueue.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Urgent Cases</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {todaysQueue.filter(a => a.triage_status?.toLowerCase() === 'urgent').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Priority</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {todaysQueue.filter(a => a.triage_status?.toLowerCase() === 'low').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Triage</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {todaysQueue.filter(a => !a.triage_status).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Queue List</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {todaysQueue.map((appt, index) => (
                  <div key={appt.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm mr-4">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Patient ID: {appt.patient}
                            </h3>
                            <p className="text-gray-600 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTime(appt.availability_start_time)} – {formatTime(appt.availability_end_time)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-12">
                          <p className="text-gray-700 mb-2">
                            <span className="font-medium">Reason:</span> {appt.reason || 'No reason specified'}
                          </p>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 mr-2">Triage Status:</span>
                            {getTriageBadge(appt.triage_status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}