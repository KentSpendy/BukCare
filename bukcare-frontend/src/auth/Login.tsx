import { useState } from 'react'
import api from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      // 1. Request token
      const res = await api.post('/login/', { email, password })
      const access = res.data.access
      const refresh = res.data.refresh

      // 2. Save tokens
      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)

      // 3. Manually update axios default headers so /whoami works
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`

      // 4. Now call /whoami
      const userRes = await api.get('/whoami/')
      const role = userRes.data.role
      console.log('🟢 Login successful. Role:', role)

      // 5. Navigate after short delay
      setTimeout(() => {
    if (role === 'doctor') window.location.href = '/doctor'
    else if (role === 'patient') window.location.href = '/patient'
    else if (role === 'staff') window.location.href = '/staff'
    else alert('Unknown role')
  }, 100)
    } catch (err) {
      alert('Login failed. Please check your email and password.')
      console.error('🔴 Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">BukCare Login</h1>
          <p className="mt-2 text-gray-600">Welcome back! Please sign in to continue.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            onClick={handleLogin}
            className={`w-full font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a className="text-blue-600 hover:text-blue-800 font-medium" href="/register">
              Register here
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
