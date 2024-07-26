'use client'
import React from 'react'

import IssueDisplay from '@aces/app/rounds/[roundId]/IssueDisplayWrapper'
import useRoundPageLogic from '@aces/app/rounds/[roundId]/useRoundPageLogic'
import { RoundSidebar } from '@aces/components/rounds/sidebar'



interface RoundPageProps {
  params: { roundId: string }
}

function RoundPage({ params }: RoundPageProps): React.ReactElement {
  const { roundId } = params
  const { user, currentIssue, isIssueLoading } = useRoundPageLogic(roundId)

  return (
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
          currentIssue={currentIssue}
          isIssueLoading={isIssueLoading}
        />
      </div>
    </div>
  )
}

export default RoundPage
