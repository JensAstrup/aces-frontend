import React from 'react'

import { CommentList } from '@aces/components/comments/comment-list'
import IssueSection from '@aces/components/issues/issue-section'
import LoadingIssues from '@aces/components/issues/loading-issues'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'


const IssueContent: React.FC = () => {
  const { currentIssue, isLoading } = useIssues()

  if (currentIssue && !isLoading) {
    return (
      <div>
        <IssueSection />
        <CommentList />
      </div>
    )
  }
  else if (isLoading) {
    return <LoadingIssues />
  }
  return (
    <div className="flex items-center justify-center min-h-[200px] flex-col">
      <h1 className="text-xl font-bold">No issues found</h1>
      <p className="text-sm text-muted-foreground">Please try another view</p>
    </div>
  )
}

export default IssueContent
