import dynamic from 'next/dynamic'
import React from 'react'

import EstimateSection from '@aces/components/estimates/estimate-section'
import { Icons } from '@aces/components/icons'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import { useVotes } from '@aces/lib/hooks/votes/use-votes'


const Votes = dynamic(() => import('@aces/components/rounds/votes'))
const Stats = dynamic(() => import('@aces/components/stats'))


interface RoundSidebarProps {
  roundId: string
}

export function RoundSidebar({ roundId }: RoundSidebarProps): JSX.Element {
  const { currentIssue, isLoading } = useIssues()
  const { votes, expectedVotes } = useVotes()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] h-full">
        <Icons.spinner className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    )
  }

  if (votes.length === 0) {
    return <EstimateSection isLoading={isLoading} roundId={roundId} issue={currentIssue} />
  }

  if (votes.length !== expectedVotes) {
    return (
      <>
        <EstimateSection isLoading={isLoading} roundId={roundId} issue={currentIssue} />
        <Votes votes={votes} expectedVotes={expectedVotes} />
      </>
    )
  }

  return (
    <>
      <Votes votes={votes} expectedVotes={expectedVotes} />
      <Stats votes={votes} />
    </>
  )
}
