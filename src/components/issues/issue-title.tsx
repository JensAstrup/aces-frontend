import dayjs from 'dayjs'
import { CalendarIcon, User, Users } from 'lucide-react'
import React from 'react'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@aces/components/ui/hover-card'
import { Issue } from '@aces/interfaces/issue'


export function IssueTitle(props: { issue: Issue }) {
  const { issue } = props
  const MAX_TITLE_LENGTH = 41
  let title = issue.title
  if (title && title.length > MAX_TITLE_LENGTH) {
    title = title.substring(0, MAX_TITLE_LENGTH) + '...'
  }
  const createdAt = dayjs(issue.createdAt).format('MMM DD, YYYY')
  return (
    <HoverCard>
      <HoverCardTrigger className="cursor-default">{title}</HoverCardTrigger>
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
