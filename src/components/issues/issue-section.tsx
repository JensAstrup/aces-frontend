import dayjs from 'dayjs'
import { CalendarIcon, ChevronLeft, ChevronRight, ExternalLink, User, Users } from 'lucide-react'
import React from 'react'

import IssueDescription from '@aces/components/issues/issue-description'
import { Button } from '@aces/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@aces/components/ui/hover-card'
import { Issue } from '@aces/interfaces/issue'


interface IssueSectionProps {
  issue: Issue
  handleNavigate?: (direction: 'next' | 'previous') => void
  hasPrevIssue?: boolean
  hasNextIssue?: boolean
}

const IssueSection: React.FC<IssueSectionProps> = ({
  issue,
  handleNavigate,
  hasPrevIssue,
  hasNextIssue
}) => {
  const maxTitleLength = 41
  let title = issue.title
  if (title && title.length > maxTitleLength) {
    title = title.substring(0, maxTitleLength) + '...'
  }
  const createdAt = dayjs(issue.createdAt).format('MMM DD, YYYY')

  const titleHoverCard = (
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
                Team
              {' '}
              {issue.team.name}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <User className="mr-2 h-4 w-4 opacity-70" />
              {' '}
              <span className="text-xs text-muted-foreground">
                Creator
                {' '}
                {issue.team.name}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )

  let issueNavigation = null
  if (handleNavigate) {
    issueNavigation = (
      <div className="flex gap-2">
        <Button
          disabled={!hasPrevIssue}
          onClick={() => {
            handleNavigate('previous')
          }}
          size="icon"
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          disabled={!hasNextIssue}
          onClick={() => {
            handleNavigate('next')
          }}
          size="icon"
          variant="outline"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }


  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">
            {titleHoverCard}
          </h2>
          <a href={issue.url}><ExternalLink className="ml-2" /></a>
        </div>
        {
          issueNavigation
        }
      </div>
      <IssueDescription description={issue.description} />
    </div>
  )
}

export default IssueSection
