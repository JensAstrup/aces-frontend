import React, { useCallback, useEffect } from 'react'

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
        }
        // eslint-disable-next-line no-case-declarations
        const data = message.payload as VoteUpdatedPayload
        setVotes(data.votes)
        setExpectedVotes(data.expectedVotes)
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
  }, [setCurrentIssue, setVotes, onVoteReceived, setExpectedVotes, onError])

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
