import React, { useCallback, useEffect } from 'react'

import { View } from '@aces/app/voting/get-favorite-views'
import getIssues, { Issue } from '@aces/app/voting/use-get-issues'


export function useSelectedView(isLoading: boolean, setIsLoading: React.Dispatch<boolean>, selectedView: View | null, setIssues: React.Dispatch<Issue[]>) {
  const logSelectedView = useCallback((view: View | null) => {
    if (view !== null) {
      setIsLoading(true)
      getIssues(view).then((viewIssues) => {
        setIssues(viewIssues)
        setIsLoading(false)
      })
    }
  }, [setIssues])

  useEffect(() => {
    if (selectedView) {
      logSelectedView(selectedView)
    }
  }, [selectedView, logSelectedView])
}
