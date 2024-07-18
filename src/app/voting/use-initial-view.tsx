import { useEffect } from 'react'

import { viewsDisplay } from '@aces/app/voting/use-views-display'


export function useInitialView(viewsDisplay: viewsDisplay | null) {
  const { favoriteViews, setSelectedView } = viewsDisplay || {}

  useEffect(() => {
    if (!favoriteViews || !setSelectedView) return
    if (favoriteViews.length > 0) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, setSelectedView])
}
