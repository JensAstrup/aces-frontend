'use client'
import React from 'react'

import RoundComponent from '@aces/app/rounds/[roundId]/round-component'
import WebSocketProvider from '@aces/app/web-socket-provider'
import useVote from '@aces/lib/api/set-vote'
import { IssuesProvider } from '@aces/lib/hooks/issues/issues-context'
import { VotesProvider } from '@aces/lib/hooks/votes/use-votes'


interface RoundPageProps {
  params: { roundId: string }
}

function RoundPage({ params }: RoundPageProps): React.ReactElement {
  const { roundId } = params
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
