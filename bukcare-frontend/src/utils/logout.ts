import api from '../services/api'

export default async function logout() {
  try {
    await api.post('/doctor/logout/')
  } catch (err) {
    console.warn('Failed to mark doctor offline during logout')
  }

  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  window.location.href = '/'
}
