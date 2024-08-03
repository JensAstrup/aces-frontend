'use client'
import React from 'react'

import IssueDisplay from '@aces/app/rounds/[roundId]/IssueDisplay'
import { RoundSidebar } from '@aces/components/rounds/sidebar'
import WebSocketProvider from '@aces/components/web-socket-provider'
import { useVote } from '@aces/lib/api/set-vote'
import useRegisterViewer from '@aces/lib/hooks/auth/use-register-viewer'
import { useUser } from '@aces/lib/hooks/auth/user-context'
import { IssuesProvider } from '@aces/lib/hooks/issues/issues-context'


interface RoundPageProps {
  params: { roundId: string }
}

function RoundPage({ params }: RoundPageProps): React.ReactElement {
  const { roundId } = params
  const { user, isLoading: isUserLoading } = useUser()
  useRegisterViewer({ roundId }, isUserLoading ? undefined : user)
  const { trigger } = useVote(roundId)

  return (
    <IssuesProvider>
      <WebSocketProvider roundId={roundId} onVoteReceived={trigger} />
      <div className="grid md:grid-cols-5 gap-6 lg:gap-12 items-start max-w-6xl px-4 mx-auto py-6">
        <div className="md:col-span-3">
          <IssueDisplay
            user={user}
            roundId={roundId}
          />
        </div>
        <div className="space-y-8 md:col-span-2">
          <RoundSidebar
            roundId={roundId}
          />
        </div>
      </div>
    </IssuesProvider>
  )
}

export default RoundPage
