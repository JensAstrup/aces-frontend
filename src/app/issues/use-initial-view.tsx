import { useEffect } from 'react'

import { ViewsDisplay } from '@aces/app/issues/use-views-display'



export function useInitialView(viewsDisplay: ViewsDisplay | null) {
  const { favoriteViews, setSelectedView } = viewsDisplay || {}

  useEffect(() => {
    if (!favoriteViews || !setSelectedView) return
    if (favoriteViews.length > 0) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, setSelectedView])
}
