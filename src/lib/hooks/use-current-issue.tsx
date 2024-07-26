import { useEffect, useState } from 'react'

import { Issue } from '@aces/interfaces/issue'
import User from '@aces/interfaces/user'
import useIssueManager from '@aces/lib/hooks/use-issue-manager'
import { ViewsDisplay } from '@aces/lib/hooks/use-views-display'
import useWebSocketIssue from '@aces/lib/hooks/use-websocket-issue'


interface UseCurrentIssueProps {
  roundId: string
  user: User | null
  viewsDisplay: ViewsDisplay | null
}

export function useCurrentIssue({ roundId, user, viewsDisplay }: UseCurrentIssueProps) {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { selectedView } = viewsDisplay || {}

  const {
    issues,
    currentIssueIndex,
    isLoading: isIssueManagerLoading,
    setCurrentIssueIndex
  } = useIssueManager({ selectedView, user, roundId })

  const { issue: webSocketIssue, isLoading: isWebSocketLoading } = useWebSocketIssue(roundId)

  useEffect(() => {
    if (user) {
      // Authenticated user: use issue from IssueManager
      if (!isIssueManagerLoading && issues.length > 0) {
        setCurrentIssue(issues[currentIssueIndex])
        setIsLoading(false)
      }
    }
    else {
      // Anonymous user: use issue from WebSocket
      if (!isWebSocketLoading) {
        setCurrentIssue(webSocketIssue)
        setIsLoading(false)
      }
    }
  }, [user, isIssueManagerLoading, issues, currentIssueIndex, isWebSocketLoading, webSocketIssue])

  const changeIssue = (index: number) => {
    if (user) {
      setCurrentIssueIndex(index)
    }
  }

  return {
    currentIssue,
    isLoading,
    changeIssue,
    totalIssues: issues.length
  }
}

export default useCurrentIssue
