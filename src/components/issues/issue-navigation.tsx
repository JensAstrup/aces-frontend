import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { Button } from '@aces/components/ui/button'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'


export function IssueNavigation() {
  const { user } = useCurrentUser()
  const { currentIssue, setCurrentIssue, issues } = useIssues()
  const [hasNextIssue, setHasNextIssue] = useState(false)
  const [hasPrevIssue, setHasPrevIssue] = useState(false)

  const getIssueIndex = useCallback(() => {
    if (!currentIssue) return null
    return issues.findIndex(issue => issue.id === currentIssue.id)
  }, [currentIssue, issues])

  useEffect(() => {
    if (!currentIssue) return
    const currentIndex = getIssueIndex()
    if (currentIndex === -1 || currentIndex === null) return
    setHasNextIssue(currentIndex < issues.length - 1)
    setHasPrevIssue(currentIndex > 0)
  }, [currentIssue, getIssueIndex, issues])

  const handleNavigate = useCallback((direction: 'next' | 'previous') => {
    if (!currentIssue) return
    const currentIndex = getIssueIndex()
    if (currentIndex === -1 || currentIndex === null) return

    let newIndex
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % issues.length
    }
    else {
      newIndex = (currentIndex - 1 + issues.length) % issues.length
    }
    if (newIndex === currentIndex) return
    setCurrentIssue(issues[newIndex])
  }, [currentIssue, getIssueIndex, setCurrentIssue, issues])

  if (!user?.linearId) return null

  return (
    <div className="flex gap-2">
      <Button
        disabled={!hasPrevIssue}
        onClick={() => {
          handleNavigate('previous')
        }}
        size="icon"
        variant="outline"
        aria-label="Previous"
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
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
