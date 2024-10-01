import dayjs from 'dayjs'
import { CalendarIcon, User, Users } from 'lucide-react'
import React from 'react'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@aces/components/ui/hover-card'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'


const MAX_TITLE_LENGTH = 41

function truncateTitle(title: string, maxLength: number): string {
  return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title
}

export function IssueTitle() {
  const { currentIssue: issue } = useIssues()
  if (!issue) return null
  const createdAt = dayjs(issue.createdAt).format('MMM DD, YYYY')
  return (
    <HoverCard>
      <HoverCardTrigger className="cursor-default">{truncateTitle(issue.title, MAX_TITLE_LENGTH)}</HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">{issue.title}</h4>
          <div className="flex items-center pt-2">
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            {' '}
            <span className="text-xs text-muted-foreground">
                Created
              {' '}
              {createdAt}
            </span>
          </div>
          <div className="flex items-center pt-2">
            <Users className="mr-2 h-4 w-4 opacity-70" />
            {' '}
            <span className="text-xs text-muted-foreground">
                Team:
              {' '}
              {issue.team.name}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <User className="mr-2 h-4 w-4 opacity-70" />
              {' '}
              <span className="text-xs">
                Creator:
                {'\n'}
                <span className="text-muted-foreground">{issue.creator.displayName}</span>
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
