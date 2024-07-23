// hooks/useWebSocketIssue.js
import { useEffect, useState } from 'react'

import { Issue } from '@aces/app/interfaces/issue'


function useWebSocketIssue(roundId: string): Issue | null {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)

  useEffect(() => {
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET}?roundId=${roundId}`)

    socket.onopen = () => {
      console.log('WebSocket connection established')
    }

    socket.onmessage = (event: MessageEvent) => {
      try {
        console.log('WebSocket message received:', event.data)
        const newIssue: Issue = JSON.parse(event.data)
        setCurrentIssue(newIssue)
      }
      catch (error) {
        console.error('Error parsing websocket message:', error)
      }
    }

    return () => {
      socket.close()
    }
  }, [roundId])

  return currentIssue
}

export default useWebSocketIssue
