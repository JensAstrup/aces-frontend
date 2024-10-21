import { Team } from '@linear/sdk'
import React, { Suspense } from 'react'

import RoundComponent from '@aces/app/rounds/[roundId]/round-component'
import RoundProviders from '@aces/app/rounds/[roundId]/round-providers'
import LoadingRound from '@aces/components/rounds/loading-round'
import { View } from '@aces/interfaces/view'
import getTeams from '@aces/lib/linear/get-teams'
import getFavoriteViews from '@aces/lib/linear/get-views'
import migrateSession from '@aces/lib/utils/migrate-session'


interface RoundPageProps {
  params: { roundId: string }
}

async function RoundPage({ params }: RoundPageProps) {
  const session = await migrateSession()
  let views: View[]
  let teams: Team[]

  if (!session || !session.user || !session.user.token) {
    views = []
    teams = []
  }
  else {
    const favorites = await getFavoriteViews(session.user)
    views = favorites
    teams = await getTeams(session.user)
  }

  return (
    <Suspense fallback={<LoadingRound />}>
      <RoundProviders views={views} teams={teams}>
        <RoundComponent views={views} teams={teams} roundId={params.roundId} />
      </RoundProviders>
    </Suspense>
  )
}

export default RoundPage
