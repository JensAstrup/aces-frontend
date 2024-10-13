import { ListBulletIcon } from '@radix-ui/react-icons'
import React, { useEffect } from 'react'

import { Button } from '@aces/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@aces/components/ui/dropdown-menu'
import { View } from '@aces/interfaces/view'
import useViews from '@aces/lib/hooks/views/views-context'


interface ViewDropdownProps {
  views: View[]
}


const ViewDropdown: React.FC<ViewDropdownProps> = ({ views }) => {
  const { selectedView, setView } = useViews()

  useEffect(() => {
    if (views.length > 0 && !selectedView) {
      setView(views[0])
    }
  }, [views, selectedView, setView])

  const favoriteViewItems = views.map(view => (
    <DropdownMenuItem
      key={view.id}
      onClick={() => {
        setView(view)
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
          <span className="pl-2">{selectedView?.name || 'Select a view'}</span>
          <div className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Select a view</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {favoriteViewItems}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ViewDropdown
