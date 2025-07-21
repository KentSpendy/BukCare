import { useEffect, useState } from 'react'
import { FileText, User, Calendar, Clock, Stethoscope, AlertTriangle, CheckCircle, XCircle, UserCheck } from 'lucide-react'
import api from '../../services/api'

interface Appointment {
  id: number
  date: string
  start_time: string
  end_time: string
  reason: string
  status: string
  triage_status: string | null
}

interface Patient {
  id: number
  email: string
  appointments: Appointment[]
}

export default function PatientSummaries() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/doctor/patient-summaries/')
        setPatients(res.data)
      } catch (err) {
        console.error('Failed to fetch summaries', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString: string) => {
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

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    
    if (normalizedStatus === 'approved') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      )
    }
    
    if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelled
        </span>
      )
    }
    
    if (normalizedStatus === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <Calendar className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  const getTriageBadge = (triageStatus: string | null) => {
    if (!triageStatus) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          <User className="w-3 h-3 mr-1" />
          Pending
        </span>
      )
    }
    
    const normalizedTriage = triageStatus.toLowerCase()
    if (normalizedTriage === 'urgent') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Urgent
        </span>
      )
    }
    
    if (normalizedTriage === 'low') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <UserCheck className="w-3 h-3 mr-1" />
          Low Priority
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <Stethoscope className="w-3 h-3 mr-1" />
        {triageStatus}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading patient summaries...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Summaries</h1>
              <p className="text-gray-600 mt-1">Comprehensive overview of patient appointments and medical history</p>
            </div>
          </div>
        </div>

        {patients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Patient Summaries Available</h3>
            <p className="text-gray-500">There are currently no patient summaries to display.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {patients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Patient Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-semibold text-gray-900">{patient.email}</h2>
                      <p className="text-sm text-gray-600">
                        Patient ID: {patient.id} • {patient.appointments.length} appointment{patient.appointments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Appointments List */}
                <div className="divide-y divide-gray-200">
                  {patient.appointments.map((appt) => (
                    <div key={appt.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-4">
                            <Calendar className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">
                              {formatDate(appt.date)}
                            </h3>
                            <p className="text-gray-600 flex items-center mt-1">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTime(appt.start_time)} – {formatTime(appt.end_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(appt.status)}
                          {getTriageBadge(appt.triage_status)}
                        </div>
                      </div>
                      
                      <div className="ml-16">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start">
                            <Stethoscope className="w-4 h-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Chief Complaint</p>
                              <p className="text-gray-600">{appt.reason || 'No reason specified'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}