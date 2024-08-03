'use client'
import { useEffect, useState } from 'react'

import { Issue } from '@aces/interfaces/issue'
import inboundHandler from '@aces/lib/socket/inbound-handler'


function useWebSocketIssue(roundId: string): { issue: Issue | null, isLoading: boolean } {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    setIsLoading(true)
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET}?roundId=${roundId}`)

    socket.onopen = () => {
      console.log('WebSocket connection established')
    }

    socket.onmessage = inboundHandler
    setIsLoading(false)
    return () => {
      socket.close()
    }
  }, [roundId])

  return { issue: currentIssue, isLoading }
}

export default useWebSocketIssue
