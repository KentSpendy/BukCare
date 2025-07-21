// doctorNotificationsSocket.ts
import ReconnectingWebSocket from 'reconnecting-websocket'

const host = window.location.host
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
const socketUrl = `${protocol}://${host}/ws/doctor-notifications/`

let socket: ReconnectingWebSocket

export const connectDoctorNotifications = (
  onMessage: (data: any) => void,
) => {
  socket = new ReconnectingWebSocket(socketUrl)

  socket.onopen = () => {
    console.log('🔗 WebSocket connected')
  }

  socket.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data)
    console.log('📥 WebSocket message:', data)
    onMessage(data)
  }

  socket.onclose = () => {
    console.log('🔌 WebSocket disconnected')
  }

  socket.onerror = (err) => {
    console.error('WebSocket error:', err)
  }

  return socket
}
