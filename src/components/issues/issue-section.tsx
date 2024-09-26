import { ExternalLink } from 'lucide-react'
import React from 'react'

import IssueDescription from '@aces/components/issues/issue-description'
import { IssueNavigation } from '@aces/components/issues/issue-navigation'
import { IssueTitle } from '@aces/components/issues/issue-title'
import { Issue } from '@aces/interfaces/issue'


interface IssueSectionProps {
  issue: Issue
  handleNavigate?: (direction: 'next' | 'previous') => void
  hasPrevIssue?: boolean
  hasNextIssue?: boolean
}

const IssueSection: React.FC<IssueSectionProps> = ({
  issue,
  handleNavigate,
  hasPrevIssue,
  hasNextIssue
}) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">
            <IssueTitle issue={issue} />
          </h2>
          <a href={issue.url} target="_blank"><ExternalLink className="ml-2" /></a>
        </div>
        <IssueNavigation handleNavigate={handleNavigate} hasPrevIssue={hasPrevIssue} hasNextIssue={hasNextIssue} />
      </div>
      <IssueDescription description={issue.description} />
    </div>
  )
}

export default IssueSection
