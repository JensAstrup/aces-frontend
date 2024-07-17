import { ListBulletIcon } from '@radix-ui/react-icons'
import React, { useEffect, useState } from 'react'

import getFavoriteViews, { View } from '@aces/app/issue/get-views'
import { Button } from '@aces/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@aces/components/ui/dropdown-menu'


const ViewDropdown: React.FC = () => {
  const [selectedViewName, setSelectedViewName] = useState<string>('Views')
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center gap-1 pr-0" size="sm" variant="outline">
          <ListBulletIcon className="h-4 w-4" />
          <span className="pl-2">{ selectedViewName }</span>
          <div className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Select a view</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {favoriteViews.map(view => (
          <DropdownMenuItem
            key={view.id}
            onClick={() => {
              setSelectedViewName(view.name)
            }}
          >
            {view.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ViewDropdown
