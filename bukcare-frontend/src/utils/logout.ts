export default function logout() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  window.location.href = '/' // Force redirect to login
}
