'use client'
import React from 'react'

import RoundComponent from '@aces/app/rounds/[roundId]/round-component'
import WebSocketProvider from '@aces/app/web-socket-provider'
import useVote from '@aces/lib/api/set-vote'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import useMigrateCookie from '@aces/lib/hooks/auth/use-migrate-cookie'
import { IssuesProvider } from '@aces/lib/hooks/issues/issues-context'
import { VotesProvider } from '@aces/lib/hooks/votes/use-votes'


interface RoundPageProps {
  params: { roundId: string }
}

function RoundPage({ params }: RoundPageProps): React.ReactElement {
  const { roundId } = params
  const { trigger } = useVote(roundId)
  const { csrfToken } = useCsrfToken()
  useMigrateCookie(csrfToken)


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
