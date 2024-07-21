import dayjs from 'dayjs'
import { CalendarIcon, ChevronLeft, ChevronRight, ExternalLink, User, Users } from 'lucide-react'
import React from 'react'

import { Issue } from '@aces/app/interfaces/issue'
import { Button } from '@aces/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@aces/components/ui/hover-card'
import IssueDescription from '@aces/components/ui/issues/issue-description'


interface IssueSectionProps {
  issue: Issue
  onPrevIssue: () => void
  onNextIssue: () => void
  hasPrevIssue: boolean
  hasNextIssue: boolean
}

const IssueSection: React.FC<IssueSectionProps> = ({
  issue,
  onPrevIssue,
  onNextIssue,
  hasPrevIssue,
  hasNextIssue
}) => {
  const maxTitleLength = 31
  let title = issue.title
  if (title && title.length > maxTitleLength) {
    title = title.substring(0, maxTitleLength) + '...'
  }
  const createdAt = dayjs(issue.createdAt).format('MMM DD, YYYY')

  const titleHoverCard = (
    <HoverCard>
      <HoverCardTrigger>{title}</HoverCardTrigger>
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


  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">
            {titleHoverCard}
          </h2>
          <a href={issue.url}><ExternalLink className="ml-2" /></a>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={!hasPrevIssue}
            onClick={onPrevIssue}
            size="icon"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            disabled={!hasNextIssue}
            onClick={onNextIssue}
            size="icon"
            variant="outline"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <IssueDescription description={issue.description} />
    </div>
  )
}

export default IssueSection
