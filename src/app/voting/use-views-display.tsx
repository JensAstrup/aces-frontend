import { useEffect, useState } from 'react'

import getFavoriteViews, { View } from '@aces/app/voting/get-favorite-views'


interface viewsDisplay {
    selectedView: View | null
    setSelectedView: (view: View) => void
    favoriteViews: View[]
}


const useViewsDisplay = (): viewsDisplay | null => {
  const [selectedView, setSelectedView] = useState<View | null>(null)
  const [favoriteViews, setFavoriteViews] = useState<View[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFavoriteViews = async () => {
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
    }

    fetchFavoriteViews()
  }, [])

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
export type { viewsDisplay }
