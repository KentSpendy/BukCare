import { useEffect, useState } from 'react'
import { History, Download, Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, AlertTriangle, UserCheck, Stethoscope } from 'lucide-react'
import api from '../../services/api'

interface Appointment {
  id: number
  status: string
  triage_status?: string
  reason: string
  created_at: string
  availability_date: string
  availability_start_time: string
  availability_end_time: string
}

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [activeTab, setActiveTab] = useState('approved')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/appointments/history/')
        setAppointments(res.data)
      } catch (err) {
        console.error('Failed to fetch appointment history', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const filtered = appointments.filter((appt) => appt.status === activeTab)

  const downloadCSV = async () => {
    setExporting(true)
    try {
      const res = await api.get('/appointments/export/', {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'appointments.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Failed to export appointments', err)
    } finally {
      setExporting(false)
    }
  }

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

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'declined':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getTabColor = (tab: string) => {
    switch (tab) {
      case 'approved':
        return 'bg-green-600 hover:bg-green-700'
      case 'cancelled':
        return 'bg-red-600 hover:bg-red-700'
      case 'declined':
        return 'bg-orange-600 hover:bg-orange-700'
      default:
        return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const getTriageBadge = (triageStatus: string | undefined) => {
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
    
    if (normalizedStatus === 'cancelled') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelled
        </span>
      )
    }
    
    if (normalizedStatus === 'declined') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          <AlertCircle className="w-3 h-3 mr-1" />
          Declined
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

  const getAppointmentCount = (status: string) => {
    return appointments.filter(appt => appt.status === status).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading appointment history...</span>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <History className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Appointment History</h1>
                <p className="text-gray-600 mt-1">Complete record of all appointment activities</p>
              </div>
            </div>
            <button
              onClick={downloadCSV}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{getAppointmentCount('approved')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{getAppointmentCount('cancelled')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Declined</p>
                <p className="text-2xl font-bold text-gray-900">{getAppointmentCount('declined')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {['approved', 'cancelled', 'declined'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {getTabIcon(tab)}
                  <span className="ml-2">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {getAppointmentCount(tab)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No {activeTab} appointments found
                </h3>
                <p className="text-gray-500">
                  There are currently no {activeTab} appointments to display.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((appt) => (
                  <div key={appt.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-150">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-white rounded-lg shadow-sm mr-4">
                          <Calendar className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {formatDate(appt.availability_date)}
                          </h3>
                          <p className="text-gray-600 flex items-center mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(appt.availability_start_time)} – {formatTime(appt.availability_end_time)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(appt.status)}
                        {getTriageBadge(appt.triage_status)}
                      </div>
                    </div>
                    
                    <div className="ml-16">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-start">
                          <Stethoscope className="w-4 h-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Reason for Visit</p>
                            <p className="text-gray-600">{appt.reason || 'No reason specified'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}