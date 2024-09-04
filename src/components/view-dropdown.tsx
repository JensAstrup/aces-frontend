import { ListBulletIcon } from '@radix-ui/react-icons'
import React, { useEffect } from 'react'

import { Button } from '@aces/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@aces/components/ui/dropdown-menu'
import { View } from '@aces/interfaces/view'
import useGetFavoriteViews from '@aces/lib/api/views/get-favorite-views'


interface ViewDropdownProps {
  selectedView: View | null
  setSelectedView: (view: View) => void
}

const ViewDropdown: React.FC<ViewDropdownProps> = ({ selectedView, setSelectedView }) => {
  const { favoriteViews, isError, isLoading } = useGetFavoriteViews()

  useEffect(() => {
    if (favoriteViews && favoriteViews.length > 0 && !selectedView) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, selectedView, setSelectedView])

  if (isError) return <div>Failed to load views</div>

  const favoriteViewItems = favoriteViews?.map(view => (
    <DropdownMenuItem
      key={view.id}
      onClick={() => {
        setSelectedView(view)
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
        {isLoading
          ? (
            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
          )
          : favoriteViewItems && favoriteViewItems.length > 0
            ? (
              favoriteViewItems
            )
            : (
              <DropdownMenuItem disabled>No views available</DropdownMenuItem>
            )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ViewDropdown
