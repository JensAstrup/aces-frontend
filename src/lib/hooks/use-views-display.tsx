import { useCallback, useEffect, useRef, useState } from 'react'

import { View } from '@aces/interfaces/view'
import getFavoriteViews from '@aces/lib/api/views/get-favorite-views'



interface ViewsDisplay {
  selectedView: View | null
  setSelectedView: (view: View) => void
  favoriteViews: View[]
}

const useViewsDisplay = (): ViewsDisplay | null => {
  const [selectedView, setSelectedView] = useState<View | null>(null)
  const [favoriteViews, setFavoriteViews] = useState<View[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isFetching = useRef(false)

  const fetchFavoriteViews = useCallback(async () => {
    if (isFetching.current) {
      return
    }
    isFetching.current = true
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const views = await getFavoriteViews(token)
        setFavoriteViews(views)
      }
      catch (error) {
        console.error('Error fetching favorite views:', error)
      }
    }
    setIsLoading(false)
    isFetching.current = false
  }, [])

  useEffect(() => {
    fetchFavoriteViews()
  }, [fetchFavoriteViews])

  if (isLoading) {
    return null
  }

  return {
    selectedView,
    setSelectedView,
    favoriteViews
  }
}

export default useViewsDisplay
export type { ViewsDisplay }
