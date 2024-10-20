'use client'

import { Team } from '@linear/sdk'
import React, { ReactNode } from 'react'

import { View } from '@aces/interfaces/view'
import { IssuesProvider } from '@aces/lib/hooks/issues/issues-context'
import { TeamsProvider } from '@aces/lib/hooks/teams/teams-context'
import { ViewsProvider } from '@aces/lib/hooks/views/views-context'
import { VotesProvider } from '@aces/lib/hooks/votes/use-votes'
import { WebSocketProvider } from '@aces/lib/socket/web-socket-provider'


interface RoundLayoutProps {
  children: ReactNode
  views: View[]
  teams: Team[]
}

export default function RoundProviders({ children, views, teams }: RoundLayoutProps): React.ReactElement {
  return (
    <ViewsProvider views={views}>
      <TeamsProvider teams={teams}>
        <IssuesProvider>
          <VotesProvider>
            <WebSocketProvider>
              {children}
            </WebSocketProvider>
          </VotesProvider>
        </IssuesProvider>
      </TeamsProvider>
    </ViewsProvider>
  )
}
