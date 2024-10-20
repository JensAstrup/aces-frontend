import { Team } from '@linear/sdk'
import React from 'react'

import IssueContent from '@aces/components/issues/issue-content'
import LoadingIssues from '@aces/components/issues/loading-issues'
import { Separator } from '@aces/components/ui/separator'
import IssueGroupDropdown from '@aces/components/views/issue-group-dropdown'
import { View } from '@aces/interfaces/view'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'


function IssueDisplay({ views, teams }: { views: View[], teams: Team[] }): React.ReactElement {
  const { user, isLoading } = useCurrentUser()

  if (isLoading) {
    return <LoadingIssues />
  }

  return (
    <div className="space-y-6">
      <div>
        {user?.linearId
          ? (
            <div className="flex gap-2">
              <IssueGroupDropdown views={views} teams={teams} />
            </div>
          )
          : <h1 className="text-2xl font-bold">Current Issue</h1>}
      </div>
      <Separator />
      <IssueContent />
    </div>
  )
}

export default IssueDisplay
