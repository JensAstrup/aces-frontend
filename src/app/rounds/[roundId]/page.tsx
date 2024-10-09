import React from 'react'

import RoundComponent from '@aces/app/rounds/[roundId]/round-component'
import RoundProviders from '@aces/app/rounds/[roundId]/round-providers'
import { View } from '@aces/interfaces/view'
import getFavoriteViews from '@aces/lib/linear/get-views'
import getSession from '@aces/lib/server/auth/session'


interface RoundPageProps {
  params: { roundId: string }
}

async function RoundPage({ params }: RoundPageProps) {
  const session = await getSession()
  let views: View[] | null

  if (!session.user || !session.user.token) {
    views = []
  }
  else {
    const favorites = await getFavoriteViews(session.user)
    views = favorites
  }

  return (
    <RoundProviders views={views}>
      <RoundComponent views={views} roundId={params.roundId} />
    </RoundProviders>
  )
}

export default RoundPage
