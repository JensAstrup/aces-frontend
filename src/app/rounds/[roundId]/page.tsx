'use client'
import React from 'react'

import RoundComponent from '@aces/app/rounds/[roundId]/round-component'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import useMigrateCookie from '@aces/lib/hooks/auth/use-migrate-cookie'
import { IssuesProvider } from '@aces/lib/hooks/issues/issues-context'
import { ViewsProvider } from '@aces/lib/hooks/views/views-context'
import { VotesProvider } from '@aces/lib/hooks/votes/use-votes'
import { WebSocketProvider } from '@aces/lib/socket/web-socket-provider'


interface RoundPageProps {
  params: { roundId: string }
}

function RoundPage({ params }: RoundPageProps): React.ReactElement {
  const { csrfToken } = useCsrfToken()
  useMigrateCookie(csrfToken)

  return (
    <ViewsProvider>
      <IssuesProvider>
        <VotesProvider>
          <WebSocketProvider>
            <RoundComponent params={params} />
          </WebSocketProvider>
        </VotesProvider>
      </IssuesProvider>
    </ViewsProvider>
  )
}

export default RoundPage
