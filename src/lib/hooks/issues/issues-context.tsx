import { Issue } from '@linear/sdk'
import { useParams } from 'next/navigation'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { getIssuesForView } from '@aces/lib/api/issues/get-issues-for-view'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import { fetchIssuesForTeam } from '@aces/lib/hooks/issues/get-issues-for-team'
import { setRoundIssue } from '@aces/lib/hooks/rounds/use-set-round-issue'
import useViews from '@aces/lib/hooks/views/views-context'
import useTeams from '@aces/lib/teams/teams-context'


interface IssuesContextProps {
  issues: Issue[]
  currentIssue: Issue | null
  setCurrentIssue: (issue: Issue | null) => Promise<void>
  setIssues: (issues: Issue[]) => void
  isLoading: boolean
  loadIssuesForViews: () => void
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


  async function loadIssuesForTeams() {
    setIsLoading(true)
    try {
      const { issues } = await fetchIssuesForTeam(selectedTeam!.id)
      console.log('issues:', issues)
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
  }

  useEffect(() => {
    if ((selectedView && selectedTeam) || selectedView) {
      loadIssuesForViews()
    }
    if (!selectedView && selectedTeam) {
      console.log('loading issues for teams')
      loadIssuesForTeams()
    }
    else {
      setIssues([])
      setCurrentIssue(null)
    }
  }, [selectedView, selectedTeam])

  async function loadIssuesForViews() {
    setIsLoading(true)
    try {
      const { issues } = await getIssuesForView(selectedView!.id)
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
  }

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
        loadIssuesForViews,
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
