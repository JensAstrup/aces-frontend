'use client'
import React, { useEffect, useState } from 'react'

import { Issue } from '@aces/app/interfaces/issue'
import { Comments } from '@aces/components/ui/comments/comments'
import IssueSection from '@aces/components/ui/issues/issue-section'


interface IssueDisplayProps {
    roundId: string
}


function UnauthenticatedIssueDisplay({ roundId }: IssueDisplayProps) {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)

  useEffect(() => {
    const socket = new WebSocket(`ws://${process.env.NEXT_PUBLIC_API_HOST}?roundId=${roundId}`)

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

    socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error)
    }

    socket.onclose = () => {
      console.log('WebSocket connection closed')
    }

    return () => {
      socket.close()
    }
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Current Issue</h1>
      {currentIssue
        ? (
          <div>
            <IssueSection
              issue={currentIssue}
            />
            <Comments issue={currentIssue} />
          </div>
        )
        : (
          <p>Waiting for new issues...</p>
        )}
    </div>
  )
}

export default UnauthenticatedIssueDisplay
