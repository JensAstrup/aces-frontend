import React from 'react'

import UnauthenticatedIssueDisplay from '@aces/app/issues/anonymous-issue-display'
import AuthenticatedIssueDisplay from '@aces/app/issues/authenticated-issue-display'
import User from '@aces/interfaces/user'
import { IssuesProvider } from '@aces/lib/hooks/issues/issues-context'


interface IssueDisplayWrapperProps {
  user: User | null
  roundId: string
}

export function IssueDisplay({ user, roundId }: IssueDisplayWrapperProps): JSX.Element {
  return user
    ? <IssuesProvider><AuthenticatedIssueDisplay roundId={roundId} /></IssuesProvider>
    : <IssuesProvider><UnauthenticatedIssueDisplay roundId={roundId} /></IssuesProvider>
}

export default IssueDisplay
