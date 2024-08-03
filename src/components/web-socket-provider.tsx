import React, { useCallback, useEffect } from 'react'

import { Issue } from '@aces/interfaces/issue'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import inboundHandler from '@aces/lib/socket/inbound-handler'


interface VotePayload {
  issueId: string
  point: number
}

interface WebSocketProviderProps {
  roundId: string
  onVoteReceived?: (vote: VotePayload) => void
  onError?: (error: string) => void
}

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  roundId,
  onVoteReceived,
  onError
}) => {
  const { setCurrentIssue } = useIssues()
  const handleMessage = useCallback((event: MessageEvent) => {
    const message = inboundHandler(event)
    if (message) {
      switch (message.event) {
      case 'roundIssueUpdated':
        setCurrentIssue(message.payload as Issue)
        break
      case 'response':
        setCurrentIssue(message.payload as Issue)
        break
      case 'voteUpdated':
        if (onVoteReceived) {
          console.log('Vote received from WebSocket:', message.payload)
        }
        console.log('Vote received from WebSocket:', message)
        break
      case 'error':
        if (onError) {
          onError(message.payload as unknown as string)
        }
        console.error('Error received from WebSocket:', message)
        break
      default:
        console.error('Unknown message type received from WebSocket:', message)
      }
    }
  }, [setCurrentIssue, onVoteReceived, onError])

  useEffect(() => {
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET}?roundId=${roundId}`)

    socket.onopen = () => {
      console.log('WebSocket connection established')
    }

    socket.onmessage = handleMessage

    return () => {
      socket.close()
    }
  }, [roundId, handleMessage])

  return null // This component doesn't render anything
}

export default WebSocketProvider
