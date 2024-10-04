'use client'
import React from 'react'

import UnauthenticatedIssueDisplay from '@aces/app/issues/anonymous-issue-display'
import AuthenticatedIssueDisplay from '@aces/app/issues/authenticated-issue-display'
import Disconnected from '@aces/components/disconnected/disconnected'
import { RoundSidebar } from '@aces/components/rounds/sidebar'
import useVote from '@aces/lib/api/set-vote'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import useRegisterViewer from '@aces/lib/hooks/auth/use-register-viewer'
import { useWebSocket } from '@aces/lib/socket/web-socket-context'
import WebSocketProvider from '@aces/lib/socket/web-socket-provider'


interface RoundComponentProps {
  params: { roundId: string }
}

function RoundComponent({ params }: RoundComponentProps): React.ReactElement {
  const { roundId } = params
  const { user, isLoading: isUserLoading } = useCurrentUser()
  useRegisterViewer({ roundId }, isUserLoading ? undefined : user)
  const { trigger } = useVote(roundId)
  const { isConnected } = useWebSocket()

  if (!isConnected) {
    return <Disconnected />
  }

  return (
    <div className="grid md:grid-cols-5 gap-6 lg:gap-12 items-start max-w-6xl px-4 mx-auto py-6">
      <div className="md:col-span-3">
        {user?.linearId ? <AuthenticatedIssueDisplay /> : <UnauthenticatedIssueDisplay />}
      </div>
      <div className="space-y-8 md:col-span-2">
        <RoundSidebar
          roundId={roundId}
        />
      </div>
      <WebSocketProvider roundId={roundId} onVoteReceived={trigger} />
    </div>
  )
}

export default RoundComponent
