'use client'

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { View } from '@aces/interfaces/view'


interface ViewsContextProps {
  views: View[]
  selectedView: View | null
  setSelectedView: (view: View) => void
}

const ViewsContext = createContext<ViewsContextProps | undefined>(undefined)

interface ViewsProviderProps {
  children: ReactNode
  views: View[]
}

const ViewsProvider: React.FC<ViewsProviderProps> = ({ children, views }) => {
  const [selectedView, setSelectedView] = useState<View | null>(() => views[0] || null)

  useEffect(() => {
    if (!selectedView && views.length > 0) {
      setSelectedView(views[0])
    }
  }, [views, selectedView])

  return (
    <ViewsContext.Provider value={{ views, selectedView, setSelectedView }}>
      {children}
    </ViewsContext.Provider>
  )
}

const useViews = (): ViewsContextProps => {
  const context = useContext(ViewsContext)
  if (!context) {
    throw new Error('useViews must be used within a ViewsProvider')
  }
  return context
}

export default useViews
export { ViewsProvider }
