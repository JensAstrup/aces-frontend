'use client'

import React, { ReactNode } from 'react'

import { View } from '@aces/interfaces/view'
import { IssuesProvider } from '@aces/lib/hooks/issues/issues-context'
import { ViewsProvider } from '@aces/lib/hooks/views/views-context'
import { VotesProvider } from '@aces/lib/hooks/votes/use-votes'
import { WebSocketProvider } from '@aces/lib/socket/web-socket-provider'


interface RoundLayoutProps {
  children: ReactNode
  views: View[]
}

export default function RoundProviders({ children, views }: RoundLayoutProps): React.ReactElement {
  return (
    <ViewsProvider views={views}>
      <IssuesProvider>
        <VotesProvider>
          <WebSocketProvider>
            {children}
          </WebSocketProvider>
        </VotesProvider>
      </IssuesProvider>
    </ViewsProvider>
  )
}
