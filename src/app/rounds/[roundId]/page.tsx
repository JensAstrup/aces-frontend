'use client'
import React, { useState } from 'react'

import RoundComponent from '@aces/app/rounds/[roundId]/round-component'
import WebSocketProvider from '@aces/app/web-socket-provider'
import Disconnected from '@aces/components/disconnected/disconnected'
import useVote from '@aces/lib/api/set-vote'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import useMigrateCookie from '@aces/lib/hooks/auth/use-migrate-cookie'
import { IssuesProvider } from '@aces/lib/hooks/issues/issues-context'
import { ViewProvider } from '@aces/lib/hooks/views/views-context'
import { VotesProvider } from '@aces/lib/hooks/votes/use-votes'


interface RoundPageProps {
  params: { roundId: string }
}

function RoundPage({ params }: RoundPageProps): React.ReactElement {
  const { roundId } = params
  const { trigger } = useVote(roundId)
  const { csrfToken } = useCsrfToken()
  useMigrateCookie(csrfToken)
  const [isConnected, setIsConnected] = useState<boolean | null>(true)

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected)
  }
  return (
    <ViewProvider>
      <IssuesProvider>
        <VotesProvider>
          {isConnected || isConnected === null ? <RoundComponent params={params} /> : <Disconnected /> }
          <WebSocketProvider roundId={roundId} onVoteReceived={trigger} onConnectionChange={handleConnectionChange} />
        </VotesProvider>
      </IssuesProvider>
    </ViewProvider>
  )
}

export default RoundPage
