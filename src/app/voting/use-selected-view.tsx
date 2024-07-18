import React, { useCallback, useEffect } from 'react'

import { View } from '@aces/app/voting/get-favorite-views'
import getIssues, { Issue } from '@aces/app/voting/use-get-issues'


export function useSelectedView(
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  selectedView: View | null,
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>
) {
  const logSelectedView = useCallback((view: View | null) => {
    if (view !== null) {
      setIsLoading(true)
      getIssues(view)
        .then((viewIssues) => {
          setIssues(viewIssues)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Failed to fetch issues:', error)
          setIsLoading(false)
        })
    }
  }, [setIsLoading, setIssues])

  useEffect(() => {
    if (selectedView) {
      logSelectedView(selectedView)
    }
  }, [selectedView, logSelectedView])
}
