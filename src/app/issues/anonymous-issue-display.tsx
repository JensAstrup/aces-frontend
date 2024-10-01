'use client'
import React, { Suspense } from 'react'

import { CommentList } from '@aces/components/comments/comment-list'
import IssueSection from '@aces/components/issues/issue-section'
import LoadingRound from '@aces/components/rounds/loading-round'
import { Separator } from '@aces/components/ui/separator'


function UnauthenticatedIssueDisplay() {
  return (
    <Suspense fallback={<LoadingRound />}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Current Issue</h1>
        <Separator className="mb-2 mt-2" />
        <IssueSection />
        <CommentList />
      </div>
    </Suspense>
  )
}

export default UnauthenticatedIssueDisplay
