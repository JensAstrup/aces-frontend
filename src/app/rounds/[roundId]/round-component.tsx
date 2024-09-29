'use client'
import React from 'react'

import UnauthenticatedIssueDisplay from '@aces/app/issues/anonymous-issue-display'
import AuthenticatedIssueDisplay from '@aces/app/issues/authenticated-issue-display'
import { RoundSidebar } from '@aces/components/rounds/sidebar'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import useRegisterViewer from '@aces/lib/hooks/auth/use-register-viewer'


interface RoundComponentProps {
  params: { roundId: string }
}

function RoundComponent({ params }: RoundComponentProps): React.ReactElement {
  const { roundId } = params
  const { user, isLoading: isUserLoading } = useCurrentUser()
  useRegisterViewer({ roundId }, isUserLoading ? undefined : user)
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
    </div>
  )
}

export default RoundComponent
