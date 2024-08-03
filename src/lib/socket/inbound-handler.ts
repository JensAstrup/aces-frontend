import SocketMessage from '@aces/interfaces/socket-message'


function inboundHandler(event: MessageEvent): SocketMessage | null {
  try {
    console.log('WebSocket message received:', event.data)
    return JSON.parse(event.data) as SocketMessage
  }
  catch (error) {
    console.error('Error parsing websocket message:', error)
    return null
  }
}

export default inboundHandler
