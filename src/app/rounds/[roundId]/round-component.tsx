'use client'
import React from 'react'

import Disconnected from '@aces/components/disconnected/disconnected'
import IssueDisplay from '@aces/components/issues/issue-display'
import LoadingRound from '@aces/components/rounds/loading-round'
import { RoundSidebar } from '@aces/components/rounds/sidebar'
import { View } from '@aces/interfaces/view'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import useMigrateCookie from '@aces/lib/hooks/auth/use-migrate-cookie'
import useRegisterViewer from '@aces/lib/hooks/auth/use-register-viewer'
import WebSocketConnection from '@aces/lib/socket/web-socket-connection'
import { useWebSocket } from '@aces/lib/socket/web-socket-provider'


interface RoundComponentProps {
  roundId: string
  views: View[]
}

function RoundComponent({ roundId, views }: RoundComponentProps): React.ReactElement {
  const { csrfToken } = useCsrfToken()
  useMigrateCookie(csrfToken)
  const { user, isLoading: isUserLoading } = useCurrentUser()
  useRegisterViewer({ roundId }, isUserLoading ? undefined : user)
  const { isConnected } = useWebSocket()

  if (!isConnected) {
    return <Disconnected />
  }

  if (isUserLoading) {
    return <LoadingRound />
  }

  return (
    <div className="grid md:grid-cols-5 gap-6 lg:gap-12 items-start max-w-6xl px-4 mx-auto py-6">
      <div className="md:col-span-3">
        <IssueDisplay views={views} />
      </div>
      <div className="space-y-8 md:col-span-2">
        <RoundSidebar roundId={roundId} />
      </div>
      <WebSocketConnection roundId={roundId} />
    </div>
  )
}

export default RoundComponent
