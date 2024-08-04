import React from 'react'

import { Icons } from '@aces/components/icons'
import { Estimate } from '@aces/components/rounds/estimate'
import { Stats } from '@aces/components/rounds/stats'
import { Votes } from '@aces/components/rounds/votes'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import { useVotes } from '@aces/lib/hooks/votes/use-votes'


interface RoundSidebarProps {
  roundId: string
}

export function RoundSidebar({ roundId }: RoundSidebarProps): JSX.Element {
  const { currentIssue, state: issueState } = useIssues()
  const { isLoading } = issueState
  const { votes, expectedVotes } = useVotes()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] h-full">
        <Icons.spinner className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    )
  }


  return (
    <>
      <Estimate isLoading={isLoading} roundId={roundId} issue={currentIssue} />
      <Votes votes={votes} expectedVotes={expectedVotes} />
      <Stats votes={votes} expectedVotes={expectedVotes} />
    </>
  )
}
