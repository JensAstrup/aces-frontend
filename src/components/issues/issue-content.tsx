import React from 'react'

import { CommentList } from '@aces/components/comments/comment-list'
import IssueSection from '@aces/components/issues/issue-section'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'


const IssueContent: React.FC = () => {
  const { currentIssue } = useIssues()

  if (currentIssue) {
    return (
      <div>
        <IssueSection />
        <CommentList />
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
