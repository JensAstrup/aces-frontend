import { useCallback, useEffect, useState } from 'react'

import setRoundIssue from '@aces/app/api/set-round-issue'
import { Issue } from '@aces/app/interfaces/issue'
import { View } from '@aces/app/issues/get-favorite-views'
import { useSelectedView } from '@aces/app/issues/use-selected-view'
import { User } from '@aces/app/oauth/user-context'


interface UseIssueManagerProps {
  selectedView: View | null | undefined
  user: User | null
  roundId: string
}

export function useIssueManager({ selectedView, user, roundId }: UseIssueManagerProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [nextPage, setNextPage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentIssueIndex, setCurrentIssueIndex] = useState<number>(0)

  if (!selectedView) {
    selectedView = null
  }

  useSelectedView(setIsLoading, selectedView, issues, setIssues, nextPage, setNextPage, currentIssueIndex)

  useEffect(() => {
    setCurrentIssueIndex(0)
  }, [selectedView])

  const updateRoundIssue = useCallback((index: number) => {
    if (user?.accessToken && issues[index]) {
      setRoundIssue(roundId, issues[index].id)
    }
  }, [user, issues, roundId])

  useEffect(() => {
    updateRoundIssue(currentIssueIndex)
  }, [currentIssueIndex, updateRoundIssue])

  const handlePrevIssue = (): void => {
    setCurrentIssueIndex(prevIndex => Math.max(0, prevIndex - 1))
  }

  const handleNextIssue = (): void => {
    setCurrentIssueIndex(prevIndex => Math.min(issues.length - 1, prevIndex + 1))
  }

  return {
    issues,
    isLoading,
    currentIssueIndex,
    handlePrevIssue,
    handleNextIssue,
  }
}

export default useIssueManager
