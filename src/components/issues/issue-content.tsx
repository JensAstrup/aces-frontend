import React from 'react'

import { Comments } from '@aces/components/comments/comments'
import { Icons } from '@aces/components/icons'
import IssueSection from '@aces/components/issues/issue-section'
import { Issue } from '@aces/interfaces/issue'


interface IssueContentProps {
  isLoading: boolean
  issues: Issue[]
  currentIssueIndex: number
  handlePrevIssue: () => void
  handleNextIssue: () => void
}

const IssueContent: React.FC<IssueContentProps> = ({
  isLoading,
  issues,
  currentIssueIndex,
  handlePrevIssue,
  handleNextIssue,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (issues.length > 0 && issues[currentIssueIndex]) {
    return (
      <div>
        <IssueSection
          hasNextIssue={currentIssueIndex < issues.length - 1}
          hasPrevIssue={currentIssueIndex > 0}
          issue={issues[currentIssueIndex]}
          onNextIssue={handleNextIssue}
          onPrevIssue={handlePrevIssue}
        />
        <Comments issue={issues[currentIssueIndex]} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] flex-col">
      <h1 className="text-xl font-bold">No issues found</h1>
      <p className="text-sm text-muted-foreground">Please try another view</p>
    </div>
  )
}

export default IssueContent
