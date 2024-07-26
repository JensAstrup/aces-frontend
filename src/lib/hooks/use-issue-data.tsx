import { useEffect, useState } from 'react'

import { Issue } from '@aces/interfaces/issue'
import User from '@aces/interfaces/user'
import useIssueManager from '@aces/lib/hooks/use-issue-manager'
import { ViewsDisplay } from '@aces/lib/hooks/use-views-display'
import useWebSocketIssue from '@aces/lib/hooks/use-websocket'


interface UseIssueDataProps {
  roundId: string
  user: User | null
  isLoading: boolean
  isRegistered: boolean
  viewsDisplay: ViewsDisplay | null
}

const useIssueData = ({ roundId, user, isLoading, isRegistered, viewsDisplay }: UseIssueDataProps): Issue | null => {
  const [issue, setIssue] = useState<Issue | null>(null)
  const { selectedView } = viewsDisplay || {}

  const {
    issues,
    currentIssueIndex,
  } = useIssueManager({ selectedView, user, roundId })

  const webSocketIssue = useWebSocketIssue(roundId)

  useEffect(() => {
    if (isRegistered && issues.length > 0) {
      console.log('Setting issue from issues:', issues[currentIssueIndex])
      setIssue(issues[currentIssueIndex])
    }
    else if (!isLoading && !user) {
      console.log('Setting issue from websocket:', webSocketIssue)
      setIssue(webSocketIssue)
    }
  }, [isRegistered, issues, currentIssueIndex, isLoading, user, webSocketIssue])

  return issue
}

export default useIssueData
