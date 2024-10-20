import { useParams } from 'next/navigation'
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

import { Issue } from '@aces/interfaces/issue'
import { getIssuesForView } from '@aces/lib/api/issues/get-issues-for-view'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import { fetchIssuesForTeam } from '@aces/lib/hooks/issues/get-issues-for-team'
import { setRoundIssue } from '@aces/lib/hooks/rounds/use-set-round-issue'
import useTeams from '@aces/lib/hooks/teams/teams-context'
import useViews from '@aces/lib/hooks/views/views-context'


interface IssuesContextProps {
  issues: Issue[]
  currentIssue: Issue | null
  setCurrentIssue: (issue: Issue | null) => Promise<void>
  setIssues: (issues: Issue[]) => void
  isLoading: boolean
}

enum IssueGroup {
  Team = 'team',
  View = 'view'
}

const IssuesContext = createContext<IssuesContextProps | undefined>(undefined)

const IssuesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([])
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { roundId } = useParams<{ roundId: string }>()
  const { selectedView } = useViews()
  const { selectedTeam } = useTeams()
  const { user } = useCurrentUser()

  const loadIssues = useCallback(async (issueGroup: IssueGroup) => {
    setIsLoading(true)
    try {
      let issues: Issue[] = []
      if (issueGroup === IssueGroup.Team && selectedTeam) {
        const issueData = await fetchIssuesForTeam(selectedTeam.id)
        issues = issueData.issues
      }
      else {
        const issueData = await getIssuesForView(selectedView!.id)
        issues = issueData.issues
      }
      setIssues(issues)
      const firstIssue: Issue | null = issues[0] || null
      setCurrentIssue(firstIssue)
      await setRoundIssue(roundId, firstIssue.id)
    }
    catch (error) {
      console.error('Failed to fetch issues:', error)
      setIssues([])
      setCurrentIssue(null)
    }
    finally {
      setIsLoading(false)
    }
  }, [roundId, selectedTeam])

  useEffect(() => {
    if ((selectedView && selectedTeam) || selectedView) {
      loadIssues(IssueGroup.View)
    }
    if (!selectedView && selectedTeam) {
      loadIssues(IssueGroup.Team)
    }
    else {
      setIssues([])
      setCurrentIssue(null)
    }
  }, [selectedView, selectedTeam, loadIssues])

  async function handleIssueChanged(issue: Issue | null) {
    setCurrentIssue(issue)
    if (issue && user?.linearId) {
      await setRoundIssue(roundId, issue.id)
    }
  }

  return (
    <IssuesContext.Provider
      value={{
        issues,
        currentIssue,
        setCurrentIssue: handleIssueChanged,
        setIssues,
        isLoading,
      }}
    >
      {children}
    </IssuesContext.Provider>
  )
}

const useIssues = (): IssuesContextProps => {
  const context = useContext(IssuesContext)
  if (!context) {
    throw new Error('useIssues must be used within an IssuesProvider')
  }
  return context
}

export default useIssues
export { IssuesProvider, useIssues }
export type { IssuesContextProps }
