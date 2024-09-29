import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

import { View } from '@aces/interfaces/view'
import { getViews } from '@aces/lib/api/views/get-favorite-views'


interface ViewContextProps {
  views: View[]
  selectedView: View | null
  setSelectedView: (view: View) => void
  isLoading: boolean
}

const ViewContext = createContext<ViewContextProps | undefined>(undefined)

const ViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [views, setViews] = useState<View[]>([])
  const [selectedView, setSelectedView] = useState<View | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const loadViews = async () => {
      setIsLoading(true)
      try {
        const fetchedViews = await getViews()
        setViews(fetchedViews)
        setSelectedView(fetchedViews[0] || null) // Default to first view
      }
      catch (error) {
        console.error('Failed to fetch views:', error)
      }
      finally {
        setIsLoading(false)
      }
    }
    loadViews()
  }, [])

  return (
    <ViewContext.Provider value={{ views, selectedView, setSelectedView, isLoading }}>
      {children}
    </ViewContext.Provider>
  )
}

const useViews = (): ViewContextProps => {
  const context = useContext(ViewContext)
  if (!context) {
    throw new Error('useView must be used within a ViewProvider')
  }
  return context
}

export default useViews
export { ViewProvider }
