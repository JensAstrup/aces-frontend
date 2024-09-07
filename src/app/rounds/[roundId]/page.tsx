'use client'
import React from 'react'

import RoundComponent from '@aces/app/rounds/[roundId]/round-component'
import WebSocketProvider from '@aces/app/web-socket-provider'
import useVote from '@aces/lib/api/set-vote'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import useRegisterViewer from '@aces/lib/hooks/auth/use-register-viewer'
import { IssuesProvider } from '@aces/lib/hooks/issues/issues-context'
import { VotesProvider } from '@aces/lib/hooks/votes/use-votes'


interface RoundPageProps {
  params: { roundId: string }
}

function RoundPage({ params }: RoundPageProps): React.ReactElement {
  const { roundId } = params
  const { user, isLoading: isUserLoading } = useCurrentUser()
  useRegisterViewer({ roundId }, isUserLoading ? undefined : user)
  const { trigger } = useVote(roundId)

  return (
    <IssuesProvider>
      <VotesProvider>
        <RoundComponent params={params} />
        <WebSocketProvider roundId={roundId} onVoteReceived={trigger} />
      </VotesProvider>
    </IssuesProvider>
  )
}

export default RoundPage
