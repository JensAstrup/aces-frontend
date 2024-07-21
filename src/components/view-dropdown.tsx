import { ListBulletIcon } from '@radix-ui/react-icons'
import React, { useEffect } from 'react'

import { viewsDisplay } from '@aces/app/issues/use-views-display'
import { Button } from '@aces/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@aces/components/ui/dropdown-menu'


interface ViewDropdownProps {
  viewsDisplay: viewsDisplay | null
}

const ViewDropdown: React.FC<ViewDropdownProps> = ({ viewsDisplay }) => {
  const { favoriteViews, selectedView, setSelectedView } = viewsDisplay || {}
  useEffect(() => {
    if (!favoriteViews || !setSelectedView) return
    if (favoriteViews.length > 0) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, setSelectedView])

  const favoriteViewItems = favoriteViews?.map(view => (
    <DropdownMenuItem
      key={view.id}
      onClick={() => {
        if (setSelectedView) {
          setSelectedView(view)
        }
      }}
    >
      {view.name}
    </DropdownMenuItem>
  ))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center gap-1 pr-0" size="sm" variant="outline">
          <ListBulletIcon className="h-4 w-4" />
          <span className="pl-2">{selectedView?.name}</span>
          <div className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Select a view</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {favoriteViewItems && favoriteViewItems.length > 0 ? favoriteViewItems : <DropdownMenuItem disabled>Loading...</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ViewDropdown
