import * as Sentry from '@sentry/nextjs'
import React, { useCallback, useEffect, useRef } from 'react'

import { RoundIssueMessage, VoteUpdatedPayload } from '@aces/interfaces/socket-message'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
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
  onConnectionChange: (isConnected: boolean) => void
}

enum WebSocketEvent {
  ROUND_ISSUE_UPDATED = 'roundIssueUpdated',
  RESPONSE = 'response',
  VOTE_UPDATED = 'voteUpdated',
  ERROR = 'error',
}

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  roundId,
  onVoteReceived,
  onError,
  onConnectionChange
}) => {
  const { currentIssue, setCurrentIssue } = useIssues()
  const { setVotes, setExpectedVotes } = useVotes()
  const socketRef = useRef<WebSocket | null>(null)
  const isUnmounting = useRef(false)
  const isDisconnecting = useRef(false)
  const { user } = useCurrentUser()

  const handleMessage = useCallback((event: MessageEvent) => {
    const message = inboundHandler(event)
    if (message) {
      switch (message.event) {
      case WebSocketEvent.RESPONSE:
      case WebSocketEvent.ROUND_ISSUE_UPDATED:
        const messagePayload = message.payload as RoundIssueMessage['payload']
        const newIssue = messagePayload.issue
        setVotes(messagePayload.votes)
        setExpectedVotes(messagePayload.expectedVotes)
        if (newIssue.id !== currentIssue?.id && !user?.linearId) {
          setCurrentIssue(newIssue)
        }

        break
      case WebSocketEvent.VOTE_UPDATED:
        if (onVoteReceived) {
          onVoteReceived(message.payload as VotePayload)
        }
        const data = message.payload as VoteUpdatedPayload
        setVotes(data.votes)
        setExpectedVotes(data.expectedVotes)
        break
      case WebSocketEvent.ERROR:
        if (onError) {
          onError(message.payload as string)
        }
        Sentry.captureException(`Error received from WebSocket: ${message.payload as string}`)
        break
      default:
        Sentry.captureException(`Unknown message type received from WebSocket: ${message.event}`)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setVotes, setExpectedVotes, currentIssue?.id, onVoteReceived, onError, setCurrentIssue])

  const disconnect = useCallback(() => {
    if (isDisconnecting.current) {
      return
    }
    isDisconnecting.current = true
    onConnectionChange(false)
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || localStorage.getItem('guestToken') || ''
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/disconnect`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ roundId }),
      // Use keepalive to allow the request to outlive the page
      keepalive: true
    })
  }, [roundId])

  useEffect(() => {
    isUnmounting.current = false
    socketRef.current = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET}?roundId=${roundId}`)
    onConnectionChange(true)

    socketRef.current.onopen = () => {
      onConnectionChange(true)
    }

    socketRef.current.onmessage = handleMessage

    socketRef.current.onclose = () => {
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
    // Following this rule would cause the effect to be run over and over again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId])

  return null // This component doesn't render anything
}

export default WebSocketProvider
