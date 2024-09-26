import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

import { Button } from '@aces/components/ui/button'


interface IssueNavigationProps {
  hasPrevIssue?: boolean
  hasNextIssue?: boolean
  handleNavigate?: (direction: 'next' | 'previous') => void
}


export function IssueNavigation({ hasPrevIssue, hasNextIssue, handleNavigate }: IssueNavigationProps) {
  // By default, users should not be able to navigate to the previous or next issue, only the host can
  if (!handleNavigate) {
    return null
  }
  return (
    <div className="flex gap-2">
      <Button
        disabled={!hasPrevIssue}
        onClick={() => {
          handleNavigate('previous')
        }}
        size="icon"
        variant="outline"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        disabled={!hasNextIssue}
        onClick={() => {
          handleNavigate('next')
        }}
        size="icon"
        variant="outline"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
