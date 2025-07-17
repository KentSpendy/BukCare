import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function EditProfile() {
  const [form, setForm] = useState({
    contact_number: '',
    specialization: '',
    profile_photo: '',
    is_available_on_call: false,
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const [verified, setVerified] = useState(false)

  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/doe1ucrfm/image/upload'
  const CLOUDINARY_UPLOAD_PRESET = 'unsigned_bukcare_uploads'

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/doctor/profile/')
      setForm({
        contact_number: res.data.contact_number || '',
        specialization: res.data.specialization || '',
        profile_photo: res.data.profile_photo || '',
        is_available_on_call: res.data.is_available_on_call || false,
      })
      setVerified(res.data.specialization_verified)
      setPreview(res.data.profile_photo || null)
    } catch (err) {
      console.error('Failed to fetch profile', err)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    if (selected) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(selected)
    }
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (!res.ok || !data.secure_url) {
      throw new Error('Failed to upload to Cloudinary')
    }

    return data.secure_url
  }

  const updateProfile = async () => {
    setStatus('Updating...')
    try {
      let photoURL = form.profile_photo

      if (file) {
        photoURL = await uploadToCloudinary(file)
      }

      await api.put('/doctor/profile/', {
        contact_number: form.contact_number,
        specialization: form.specialization,
        profile_photo: photoURL,
        is_available_on_call: form.is_available_on_call,
      })

      setStatus('Profile updated successfully.')
      fetchProfile()
    } catch (err) {
      console.error('Failed to update profile', err)
      setStatus('Update failed.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleToggle = () => {
    setForm(prev => ({
      ...prev,
      is_available_on_call: !prev.is_available_on_call,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 sm:px-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Doctor Profile</h1>
                <p className="text-blue-100 mt-1">Manage your professional information</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Profile Photo Section */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Photo</h3>
                  
                  <div className="mb-4">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile Preview"
                        className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Choose Photo</span>
                    </button>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Verification Status</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className={`text-sm font-medium ${verified ? 'text-green-700' : 'text-yellow-700'}`}>
                      {verified ? 'Verified' : 'Pending Approval'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  
                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        name="contact_number"
                        value={form.contact_number}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Enter your contact number"
                      />
                    </div>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medical Specialization
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <input
                        name="specialization"
                        value={form.specialization}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="e.g., Cardiology, Neurology, Pediatrics"
                      />
                    </div>
                  </div>

                  {/* Availability Toggle */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Availability Settings</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${form.is_available_on_call ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <label htmlFor="available-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Available for On-Call Services
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            {form.is_available_on_call ? 'You are currently online and available' : 'You are currently offline'}
                          </p>
                        </div>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          id="available-toggle"
                          type="checkbox"
                          checked={form.is_available_on_call}
                          onChange={handleToggle}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      onClick={updateProfile}
                      disabled={status === 'Updating...'}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center space-x-2"
                    >
                      {status === 'Updating...' ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Status Message */}
                  {status && (
                    <div className={`p-4 rounded-lg border ${
                      status.includes('successfully') 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : status.includes('failed') 
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {status.includes('successfully') && (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {status.includes('failed') && (
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <span className="text-sm font-medium">{status}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}