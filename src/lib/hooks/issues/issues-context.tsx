import React, { ReactNode, createContext, useCallback, useContext, useReducer, useState } from 'react'

import { Issue } from '@aces/interfaces/issue'
import { View } from '@aces/interfaces/view'


interface IssuesState {
  issues: Issue[]
  currentIssueIndex: number
  selectedView: View | null
  nextPage: string | null
  isLoading: boolean
}

type Action =
  | { type: 'SET_ISSUES', payload: Issue[] }
  | { type: 'SET_CURRENT_ISSUE_INDEX', payload: number }
  | { type: 'SET_SELECTED_VIEW', payload: View | null }
  | { type: 'SET_NEXT_PAGE', payload: string | null }
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'APPEND_ISSUES', payload: Issue[] }

const initialState: IssuesState = {
  issues: [],
  currentIssueIndex: 0,
  selectedView: null,
  nextPage: null,
  isLoading: false,
}

function issuesReducer(state: IssuesState, action: Action): IssuesState {
  switch (action.type) {
  case 'SET_ISSUES':
    return { ...state, issues: action.payload, isLoading: false }
  case 'SET_CURRENT_ISSUE_INDEX':
    return { ...state, currentIssueIndex: action.payload, isLoading: false }
  case 'SET_SELECTED_VIEW':
    return { ...state, selectedView: action.payload, issues: [], currentIssueIndex: 0, nextPage: null, isLoading: true }
  case 'SET_NEXT_PAGE':
    return { ...state, nextPage: action.payload }
  case 'SET_LOADING':
    return { ...state, isLoading: action.payload }
  default:
    return state
  }
}

const IssuesContext = createContext<{
  state: IssuesState
  dispatch: React.Dispatch<Action>
  currentIssue: Issue | null
  setCurrentIssue: (issue: Issue | null) => void
    } | undefined>(undefined)

function IssuesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(issuesReducer, initialState)

  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)

  const setCurrentIssueCallback = useCallback((issue: Issue | null) => {
    console.log('Setting current issue:', issue)
    setCurrentIssue(issue)
  }, [])

  return (
    <IssuesContext.Provider value={{ state, dispatch, currentIssue, setCurrentIssue: setCurrentIssueCallback }}>
      {children}
    </IssuesContext.Provider>
  )
}

function useIssues() {
  const context = useContext(IssuesContext)
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssuesProvider')
  }
  return context
}

export { IssuesProvider, useIssues }
export type { IssuesState }
