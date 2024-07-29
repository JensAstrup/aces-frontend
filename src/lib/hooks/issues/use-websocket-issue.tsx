import { useEffect, useState } from 'react'

import { Issue } from '@aces/interfaces/issue'


function useWebSocketIssue(roundId: string): { issue: Issue | null, isLoading: boolean } {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    setIsLoading(true)
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET}?roundId=${roundId}`)

    socket.onopen = () => {
      console.log('WebSocket connection established')
    }

    socket.onmessage = (event: MessageEvent) => {
      try {
        console.log('WebSocket message received:', event.data)
        const newIssue: Issue = JSON.parse(event.data)
        setCurrentIssue(newIssue)
        setIsLoading(false)
      }
      catch (error) {
        console.error('Error parsing websocket message:', error)
        setIsLoading(false)
      }
    }

    return () => {
      socket.close()
    }
  }, [roundId])

  return { issue: currentIssue, isLoading }
}

export default useWebSocketIssue
