import React from 'react'

import { CommentList } from '@aces/components/comments/comment-list'
import IssueSection from '@aces/components/issues/issue-section'
import { Issue } from '@aces/interfaces/issue'


interface IssueContentProps {
  issue: Issue | null
  handleNavigate: (direction: 'next' | 'previous') => void
}

const IssueContent: React.FC<IssueContentProps> = ({ issue, handleNavigate }) => {
  if (issue) {
    return (
      <div>
        <IssueSection
          hasNextIssue={true}
          hasPrevIssue={true}
          issue={issue}
          handleNavigate={handleNavigate}
        />
        <CommentList issue={issue} />
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
