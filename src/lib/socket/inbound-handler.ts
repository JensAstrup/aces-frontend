import * as Sentry from '@sentry/nextjs'

import SocketMessage from '@aces/interfaces/socket-message'


function inboundHandler(event: MessageEvent): SocketMessage | null {
  try {
    Sentry.addBreadcrumb({ category: 'socket', message: 'Inbound message received', level: 'info', data: { event } })
    return JSON.parse(event.data) as SocketMessage
  }
  catch (error) {
    Sentry.captureException(error)
    return null
  }
}

export default inboundHandler
