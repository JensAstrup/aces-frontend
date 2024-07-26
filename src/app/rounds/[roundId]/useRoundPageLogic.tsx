import { useEffect } from 'react'

import useCurrentIssue from '@aces/lib/hooks/use-current-issue'
import useRegisterViewer from '@aces/lib/hooks/use-register-viewer'
import useViewsDisplay, { ViewsDisplay } from '@aces/lib/hooks/use-views-display'
import { useUser } from '@aces/lib/hooks/user-context'


function useRoundPageLogic(roundId: string) {
  const viewsDisplay: ViewsDisplay | null = useViewsDisplay()
  const { user, isLoading: isUserLoading } = useUser()
  const { favoriteViews, setSelectedView } = viewsDisplay || {}
  useRegisterViewer({ roundId }, isUserLoading ? undefined : user)

  const { currentIssue, isLoading: isIssueLoading } = useCurrentIssue({ roundId, user, viewsDisplay })

  useEffect(() => {
    if (!favoriteViews || !setSelectedView) return
    if (favoriteViews.length > 0) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, setSelectedView])

  return {
    user,
    isUserLoading,
    viewsDisplay,
    currentIssue,
    isIssueLoading
  }
}

export default useRoundPageLogic
