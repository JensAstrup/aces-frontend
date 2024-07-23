import React, { useCallback, useEffect, useRef } from 'react'

import { Issue } from '@aces/app/interfaces/issue'
import { View } from '@aces/app/issues/get-favorite-views'
import getIssues from '@aces/app/issues/use-get-issues'


export function useSelectedView(
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  selectedView: View | null,
  issues: Issue[],
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>,
  nextPage: string | null,
  setNextPage: React.Dispatch<React.SetStateAction<string | null>>,
  currentIssueIndex: number
): void {
  const isFetchingRef = useRef<boolean>(false)

  const getViewIssues = useCallback((view: View | null, page: string | null = null) => {
    if (view !== null && !isFetchingRef.current) {
      setIsLoading(true)
      isFetchingRef.current = true

      getIssues(view, page)
        .then((viewIssues) => {
          setIssues((prevIssues) => {
            if (page === null) {
              return viewIssues.issues
            }
            else {
              return [...prevIssues, ...viewIssues.issues]
            }
          })
          setNextPage(viewIssues.nextPage)
          setIsLoading(false)
          isFetchingRef.current = false
        })
        .catch((error) => {
          console.error('Failed to fetch issues:', error)
          setIsLoading(false)
          isFetchingRef.current = false
        })
    }
  }, [setIsLoading, setIssues, setNextPage])

  useEffect(() => {
    if (selectedView) {
      setIssues([]) // Reset issues when selectedView changes
      setNextPage(null) // Reset nextPage when selectedView changes
      getViewIssues(selectedView)
    }
  }, [selectedView, getViewIssues, setIssues, setNextPage])

  useEffect(() => {
    if (currentIssueIndex === issues.length - 1 && nextPage && !isFetchingRef.current) {
      getViewIssues(selectedView, nextPage)
    }
  }, [currentIssueIndex, nextPage, selectedView, getViewIssues, issues.length])
}
