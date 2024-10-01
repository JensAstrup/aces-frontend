import { useParams } from 'next/navigation'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { Issue } from '@aces/interfaces/issue'
import { getIssuesForView } from '@aces/lib/api/get-issues-for-view'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import { setRoundIssue } from '@aces/lib/hooks/rounds/use-set-round-issue'
import useViews from '@aces/lib/hooks/views/views-context'


interface IssuesContextProps {
  issues: Issue[]
  currentIssue: Issue | null
  setCurrentIssue: (issue: Issue | null) => void
  setIssues: (issues: Issue[]) => void
  isLoading: boolean
  loadIssues: () => void
}

const IssuesContext = createContext<IssuesContextProps | undefined>(undefined)

export const IssuesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([])
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { roundId } = useParams<{ roundId: string }>()
  const { selectedView } = useViews()
  const { user } = useCurrentUser()

  useEffect(() => {
    if (selectedView) {
      loadIssues()
    }
    else {
      setIssues([])
      setCurrentIssue(null)
    }
  }, [selectedView])

  async function loadIssues() {
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
        loadIssues,
      }}
    >
      {children}
    </IssuesContext.Provider>
  )
}

export const useIssues = (): IssuesContextProps => {
  const context = useContext(IssuesContext)
  if (!context) {
    throw new Error('useSimpleIssues must be used within an IssuesProvider')
  }
  return context
}
