import { useEffect, useState } from 'react'
import {
  Calendar, Clock, User, FileText, Eye, Check, X,
  AlertCircle, CheckCircle, XCircle, Loader2
} from 'lucide-react'

import api from '../../services/api'
import { Link } from 'react-router-dom'

interface Appointment {
  id: number
  status: string
  reason: string
  patient_name?: string
  availability_date: string
  availability_start_time: string
  availability_end_time: string
  profile_photo?: string
  triage_status: string
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/')
      setAppointments(res.data)
    } catch (err) {
      console.error('Failed to load appointments', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.patch(`/appointments/${id}/`, { status })
      fetchAppointments()
    } catch (err) {
      console.error('Failed to update appointment', err)
    }
  }

  const formatTime = (time: string) => {
    if (!time) return 'N/A'
    const [hour, min] = time.split(':')
    return `${hour}:${min}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      case 'approved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'declined':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Appointments</h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base">Review and manage your upcoming patient appointments</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600 font-medium">Loading appointments...</span>
            </div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500">You don't have any appointments scheduled at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => {
              const statusConfig = getStatusConfig(appt.status)

              return (
                <div
                  key={appt.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {appt.profile_photo ? (
                            <img
                              src={appt.profile_photo}
                              alt={`${appt.patient_name || 'Patient'} profile`}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallbackIcon = document.createElement('span');
                                  fallbackIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
                                  parent.appendChild(fallbackIcon);
                                }
                              }}
                            />
                          ) : (
                            <User className="w-6 h-6 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {appt.patient_name || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-500">Appointment #{appt.id}</p>
                        </div>
                      </div>

                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border`}>
                        {statusConfig.icon}
                        <span className="capitalize">{appt.status}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium text-gray-900">{formatDate(appt.availability_date)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-medium text-gray-900">
                              {formatTime(appt.availability_start_time)} – {formatTime(appt.availability_end_time)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Reason</p>
                          <p className="font-medium text-gray-900">{appt.reason || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Triage Status</p>
                          <p className="font-medium text-gray-900">{appt.triage_status || 'N/A'}</p>
                        </div>
                      </div>

                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <Link
                        to={`/doctor/appointments/${appt.id}`}
                        className="inline-flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>

                      {appt.status === 'pending' && (
                        <>
                          <button
                            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                            onClick={() => handleStatusUpdate(appt.id, 'approved')}
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                            onClick={() => handleStatusUpdate(appt.id, 'declined')}
                          >
                            <X className="w-4 h-4" />
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
