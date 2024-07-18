import { ExternalLink } from 'lucide-react'
import React from 'react'

import { Issue } from '@aces/app/voting/use-get-issues'
import IssueDescription from '@aces/components/ui/issues/issue-description'


interface IssueSectionProps {
  issue: Issue | undefined
}

const IssueSection: React.FC<IssueSectionProps> = ({ issue }) => {
  // Truncate issue.title to 32 characters
  const maxTitleLength = 35
  let title = issue?.title
  if (title && title.length > maxTitleLength) {
    title = title.substring(0, maxTitleLength) + '...'
  }
  return (
    <div>
      <div className="flex items-center">
        <h2 className="text-2xl font-bold">
          {title}
        </h2>
        <a href={issue?.url}><ExternalLink className="ml-2" /></a>
      </div>
      <IssueDescription description={issue?.description ? issue.description : ''} />
    </div>
  )
}

export default IssueSection
