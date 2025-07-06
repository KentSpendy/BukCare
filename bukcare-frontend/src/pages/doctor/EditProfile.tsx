import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function EditProfile() {
  const [form, setForm] = useState({
    contact_number: '',
    specialization: '',
    profile_photo: ''
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const [verified, setVerified] = useState(false)

  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/doe1ucrfm/image/upload'
  const CLOUDINARY_UPLOAD_PRESET = 'unsigned_bukcare_uploads'

  const fetchProfile = async () => {
    try {
      const res = await api.get('/doctor/profile/')
      setForm({
        contact_number: res.data.contact_number || '',
        specialization: res.data.specialization || '',
        profile_photo: res.data.profile_photo || ''
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

    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok || !data.secure_url) {
        throw new Error('Cloudinary upload failed')
      }

      return data.secure_url
    } catch (err) {
      console.error('Upload to Cloudinary failed:', err)
      throw err
    }
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
        profile_photo: photoURL
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

  useEffect(() => {
    fetchProfile()
  }, [])

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Doctor Profile</h1>

      <div className="space-y-4">
        <input
          name="contact_number"
          value={form.contact_number}
          onChange={handleChange}
          className="input"
          placeholder="Contact Number"
        />

        <input
          name="specialization"
          value={form.specialization}
          onChange={handleChange}
          className="input"
          placeholder="Specialization"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-24 rounded-full mt-2 object-cover"
            />
          )}
        </div>

        <div className="text-sm text-gray-600">
          Specialization Verified:{' '}
          <span className={verified ? 'text-green-600' : 'text-yellow-500'}>
            {verified ? 'Yes' : 'Pending Approval'}
          </span>
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={updateProfile}
        >
          Save Changes
        </button>

        {status && <p className="text-sm text-gray-600 mt-2">{status}</p>}
      </div>
    </div>
  )
}
