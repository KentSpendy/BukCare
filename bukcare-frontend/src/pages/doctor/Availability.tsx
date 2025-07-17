import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Availability {
  id: number
  date: string
  start_time: string
  end_time: string
}

export default function AvailabilityPage() {
  const [form, setForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    repeat: 'none',
    repeat_until: ''
  })

  const [status, setStatus] = useState('')
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchAvailabilities = async () => {
    try {
      const res = await api.get('/availabilities/')
      setAvailabilities(res.data)
    } catch (err) {
      console.error('Failed to fetch availabilities', err)
      setStatus('Failed to load availability data.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    // Clear status when user starts typing
    if (status) setStatus('')
  }

  const handleAdd = async () => {
    if (!form.date || !form.start_time || !form.end_time) {
      setStatus('Please fill in all required fields.')
      return
    }

    // Validate time logic
    if (form.start_time >= form.end_time) {
      setStatus('End time must be after start time.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/availabilities/', form)
      setStatus('Availability created successfully! 🎉')
      setForm({
        date: '',
        start_time: '',
        end_time: '',
        repeat: 'none',
        repeat_until: ''
      })
      fetchAvailabilities()
    } catch (err) {
      console.error('Failed to create availability', err)
      setStatus('Failed to save availability. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) {
      return
    }

    try {
      await api.delete(`/availabilities/${id}/`)
      setStatus('Availability slot deleted successfully.')
      fetchAvailabilities()
    } catch (err) {
      console.error('Failed to delete availability', err)
      setStatus('Failed to delete availability slot.')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const time = new Date(`1970-01-01T${timeString}`)
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    if (status.includes('successfully') || status.includes('🎉')) {
      return 'text-green-600 bg-green-50 border-green-200'
    }
    if (status.includes('Failed') || status.includes('Please fill')) {
      return 'text-red-600 bg-red-50 border-red-200'
    }
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  useEffect(() => {
    fetchAvailabilities()
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">⏰ Manage Your Availability</h1>
        <p className="text-blue-100">Set your schedule and let patients book appointments</p>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Availability
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={form.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat Pattern
            </label>
            <select
              name="repeat"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={form.repeat}
              onChange={handleChange}
            >
              <option value="none">No Repeat</option>
              <option value="weekly">Repeat Weekly</option>
              <option value="biweekly">Repeat Biweekly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="start_time"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={form.start_time}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="end_time"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={form.end_time}
              onChange={handleChange}
            />
          </div>

          {form.repeat !== 'none' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat Until
              </label>
              <input
                type="date"
                name="repeat_until"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={form.repeat_until}
                onChange={handleChange}
                min={form.date}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={handleAdd}
            disabled={submitting}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Availability
              </>
            )}
          </button>

          {status && (
            <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${getStatusColor(status)}`}>
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Availability List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Your Scheduled Availability
          </h2>
          <p className="text-gray-600 mt-1">
            {availabilities.length} slot{availabilities.length !== 1 ? 's' : ''} available for booking
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="ml-4 text-gray-600">Loading availability...</p>
            </div>
          ) : availabilities.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No availability set</h3>
              <p className="text-gray-600">Add your first availability slot to start accepting appointments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availabilities.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{formatDate(slot.date)}</h3>
                      <p className="text-sm text-gray-600">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Available
                    </span>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete availability"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}