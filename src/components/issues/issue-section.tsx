import { ExternalLink } from 'lucide-react'
import React from 'react'

import IssueDescription from '@aces/components/issues/issue-description'
import { IssueNavigation } from '@aces/components/issues/issue-navigation'
import { IssueTitle } from '@aces/components/issues/issue-title'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'


const IssueSection: React.FC = () => {
  const { currentIssue } = useIssues()
  if (!currentIssue) return null
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">
            <IssueTitle />
          </h2>
          <a href={currentIssue.url} target="_blank"><ExternalLink className="ml-2" /></a>
        </div>
        <IssueNavigation />
      </div>
      <IssueDescription description={currentIssue.description} />
    </div>
  )
}

export default IssueSection
