import React from 'react'

import UnauthenticatedIssueDisplay from '@aces/app/issues/anonymous-issue-display'
import AuthenticatedIssueDisplay from '@aces/app/issues/authenticated-issue-display'
import User from '@aces/interfaces/user'


interface IssueDisplayWrapperProps {
  user: User | null
  roundId: string
}

export function IssueDisplay({ user, roundId }: IssueDisplayWrapperProps): JSX.Element {
  return user && user.linearId
    ? <AuthenticatedIssueDisplay roundId={roundId} />
    : <UnauthenticatedIssueDisplay />
}

export default IssueDisplay
