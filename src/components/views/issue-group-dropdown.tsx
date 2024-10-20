import { ListBulletIcon } from '@radix-ui/react-icons'
import React from 'react'

import { Button } from '@aces/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@aces/components/ui/dropdown-menu'
import Team from '@aces/interfaces/team'
import { View } from '@aces/interfaces/view'
import useViews from '@aces/lib/hooks/views/views-context'
import useTeams from '@aces/lib/teams/teams-context'


interface IssueGroupDropdownProps {
  views: View[]
  teams: Team[]
}


const IssueGroupDropdown: React.FC<IssueGroupDropdownProps> = ({ views, teams }) => {
  const { selectedView, setView } = useViews()
  const { selectedTeam, setTeam } = useTeams()

  const favoriteViewItems = views.map(view => (
    <DropdownMenuItem
      key={view.id}
      onClick={() => {
        setView(view)
        setTeam(null)
      }}
    >
      {view.name}
    </DropdownMenuItem>
  ))

  const teamItems = teams.map(team => (
    <DropdownMenuItem
      key={team.id}
      onClick={() => {
        setTeam(team)
        setView(null)
      }}
    >
      {team.name}
    </DropdownMenuItem>
  ))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center gap-1 pr-0" size="sm" variant="outline">
          <ListBulletIcon className="h-4 w-4" />
          <span className="pl-2">{selectedTeam?.name || selectedView?.name || 'Select a team'}</span>
          <div className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Views</DropdownMenuLabel>
        <DropdownMenuGroup>
          {favoriteViewItems}
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Teams</DropdownMenuLabel>
          {teamItems}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default IssueGroupDropdown
