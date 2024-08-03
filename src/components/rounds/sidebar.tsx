import React from 'react'

import { Estimate } from '@aces/components/estimate'
import { Icons } from '@aces/components/icons'
import { Stats } from '@aces/components/ui/stats'
import { Votes } from '@aces/components/votes'
import WebSocketProvider from '@aces/components/web-socket-provider'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'


interface RoundSidebarProps {
  roundId: string
}

export function RoundSidebar({ roundId }: RoundSidebarProps): JSX.Element {
  const { currentIssue } = useIssues()
  console.log('currentIssue', currentIssue)

  if (!currentIssue) {
    return (
      <div className="flex justify-center items-center min-h-[200px] h-full">
        <Icons.spinner className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    )
  }

  return (
    <>
      <WebSocketProvider roundId={roundId} />
      <Estimate roundId={roundId} issue={currentIssue} />
      <Votes />
      <Stats />
    </>
  )
}
