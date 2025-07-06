import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('patient')  // You can limit this or expand later
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      await api.post('/register/', { email, password, role })
      alert('Registration successful! Please log in.')
      navigate('/')
    } catch (err) {
      alert('Registration failed.')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">BukCare Registration</h1>

      <input
        className="border px-4 py-2 rounded w-72"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border px-4 py-2 rounded w-72"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
        className="border px-4 py-2 rounded w-72"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="patient">Patient</option>
        {/* Doctor/Staff registration is handled by admin only */}
      </select>

      <button
        className="bg-green-600 text-white px-4 py-2 rounded w-72"
        onClick={handleRegister}
      >
        Register
      </button>
    </div>
  )
}
