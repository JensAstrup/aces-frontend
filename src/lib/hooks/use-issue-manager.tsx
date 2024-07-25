import { useCallback, useEffect, useRef, useState } from 'react'

import setRoundIssue from '@aces/app/api/set-round-issue'
import { Issue } from '@aces/app/interfaces/issue'
import User from '@aces/app/interfaces/user'
import { View } from '@aces/app/issues/get-favorite-views'
import { useSelectedView } from '@aces/app/issues/use-selected-view'


interface UseIssueManagerProps {
  selectedView: View | null | undefined
  user: User | null
  roundId: string
}

function useIssueManager({ selectedView, user, roundId }: UseIssueManagerProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [nextPage, setNextPage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentIssueIndex, setCurrentIssueIndex] = useState<number>(0)
  const isInitialMount = useRef(true)

  useSelectedView(
    setIsLoading,
    selectedView || null,
    issues,
    setIssues,
    nextPage,
    setNextPage,
    currentIssueIndex
  )

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    }
    else {
      setCurrentIssueIndex(0)
    }
  }, [selectedView])

  const updateRoundIssue = useCallback((index: number) => {
    if (user?.accessToken && issues[index]) {
      setRoundIssue(roundId, issues[index].id).catch((error) => {
        console.error('Failed to update round issue', error)
      })
    }
  }, [user, issues, roundId])

  useEffect(() => {
    if (!isLoading && issues.length > 0) {
      updateRoundIssue(currentIssueIndex)
    }
  }, [currentIssueIndex, updateRoundIssue, isLoading, issues])

  const handlePrevIssue = useCallback((): void => {
    setCurrentIssueIndex(prevIndex => Math.max(0, prevIndex - 1))
  }, [])

  const handleNextIssue = useCallback((): void => {
    setCurrentIssueIndex(prevIndex => Math.min(issues.length - 1, prevIndex + 1))
  }, [issues.length])

  return {
    issues,
    isLoading,
    currentIssueIndex,
    handlePrevIssue,
    handleNextIssue,
  }
}

export default useIssueManager
