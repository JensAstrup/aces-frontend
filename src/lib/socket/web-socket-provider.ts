import * as Sentry from '@sentry/nextjs'
import React, { useCallback, useEffect, useRef } from 'react'

import { RoundIssueMessage, VoteUpdatedPayload } from '@aces/interfaces/socket-message'
import useVote from '@aces/lib/api/set-vote'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import useIssues from '@aces/lib/hooks/issues/issues-context'
import { useVotes } from '@aces/lib/hooks/votes/use-votes'
import inboundHandler from '@aces/lib/socket/inbound-handler'
import { useWebSocket } from '@aces/lib/socket/web-socket-context'


interface VotePayload {
  issueId: string
  point: number
}

interface WebSocketProviderProps {
  roundId: string
  onVoteReceived?: (vote: VotePayload) => void
  onError?: (error: string) => void
}

enum WebSocketEvent {
  ROUND_ISSUE_UPDATED = 'roundIssueUpdated',
  RESPONSE = 'response',
  VOTE_UPDATED = 'voteUpdated',
  ERROR = 'error',
}

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  roundId,
  onError,
}) => {
  const { setIsConnected } = useWebSocket()
  const { setVotes, setExpectedVotes } = useVotes()
  const { trigger: onVoteReceived } = useVote(roundId)
  const { setCurrentIssue, currentIssue } = useIssues()
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
        onVoteReceived(message.payload as VotePayload)
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
  }, [setVotes, setExpectedVotes, setCurrentIssue, onVoteReceived, onError, user])

  const disconnect = useCallback(() => {
    if (isDisconnecting.current) {
      return
    }
    isDisconnecting.current = true
    onConnectionChange(false)
    const headers = {
      'Content-Type': 'application/json',
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/disconnect`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ roundId }),
      keepalive: true,
      credentials: 'include'
    })
  }, [roundId])

  useEffect(() => {
    let ws: WebSocket | null = null

    const connect = () => {
      ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET}?roundId=${roundId}`)
      socketRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
      }

      ws.onmessage = handleMessage

      ws.onclose = () => {
        disconnect()
        setIsConnected(false)
      }
    }

    if (!isUnmounting.current && !socketRef.current) {
      connect()
    }
  }, [roundId, handleMessage, setIsConnected, disconnect])

  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnect()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [disconnect])

  return null
}

export default WebSocketProvider
