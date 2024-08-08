import React, { useCallback, useEffect, useRef } from 'react'

import { Issue } from '@aces/interfaces/issue'
import { VoteUpdatedPayload } from '@aces/interfaces/socket-message'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import { useVotes } from '@aces/lib/hooks/votes/use-votes'
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
  const { setVotes, setExpectedVotes } = useVotes()
  const socketRef = useRef<WebSocket | null>(null)
  const isUnmounting = useRef(false)
  const isDisconnecting = useRef(false)

  const handleMessage = useCallback((event: MessageEvent) => {
    const message = inboundHandler(event)
    if (message) {
      switch (message.event) {
      case 'roundIssueUpdated':
        setCurrentIssue(message.payload as Issue)
        setVotes([])
        break
      case 'response':
        setCurrentIssue(message.payload as Issue)
        break
      case 'voteUpdated':
        if (onVoteReceived) {
          console.log('Vote received from WebSocket:', message.payload)
          onVoteReceived(message.payload as VotePayload)
        }
        const data = message.payload as VoteUpdatedPayload
        setVotes(data.votes)
        setExpectedVotes(data.expectedVotes)
        break
      case 'error':
        if (onError) {
          onError(message.payload as string)
        }
        console.error('Error received from WebSocket:', message)
        break
      default:
        console.error('Unknown message type received from WebSocket:', message)
      }
    }
  }, [setCurrentIssue, setVotes, onVoteReceived, setExpectedVotes, onError])

  const disconnect = useCallback(() => {
    if (isDisconnecting.current) {
      return
    }
    isDisconnecting.current = true
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || localStorage.getItem('guestToken') || ''
    }
      // Fallback to fetch for older browsers
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/disconnect`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ roundId }),
        // Use keepalive to allow the request to outlive the page
        keepalive: true
      }).catch((error) => {
        console.error('Error disconnecting from round:', error)
      })
  }, [roundId])

  useEffect(() => {
    isUnmounting.current = false
    socketRef.current = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET}?roundId=${roundId}`)

    socketRef.current.onmessage = handleMessage

    socketRef.current.onclose = (event) => {
      console.log('WebSocket connection closed:', event)
      if (isUnmounting.current) {
        disconnect()
      }
    }

    const handleBeforeUnload = () => {
      isUnmounting.current = true
      if (socketRef.current) {
        socketRef.current.close()
      }
      disconnect()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      isUnmounting.current = true
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [roundId, handleMessage, disconnect])

  return null // This component doesn't render anything
}

export default WebSocketProvider
