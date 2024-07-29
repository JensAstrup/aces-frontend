import { act, renderHook } from '@testing-library/react'
import React from 'react'

import { Issue } from '@aces/interfaces/issue'
import { View } from '@aces/interfaces/view'
import { IssuesProvider, useIssues } from '@aces/lib/hooks/issues/issues-context'


describe('IssuesContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <IssuesProvider>{children}</IssuesProvider>
  )

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useIssues(), { wrapper })

    expect(result.current.state).toEqual({
      issues: [],
      currentIssueIndex: 0,
      selectedView: null,
      nextPage: null,
      isLoading: false,
    })
  })

  it('should set issues', () => {
    const { result } = renderHook(() => useIssues(), { wrapper })

    act(() => {
      result.current.dispatch({ type: 'SET_ISSUES', payload: [{ id: '1', title: 'Test Issue' } as Issue] })
    })

    expect(result.current.state.issues).toEqual([{ id: '1', title: 'Test Issue' }])
    expect(result.current.state.isLoading).toBe(false)
  })

  it('should set current issue index', () => {
    const { result } = renderHook(() => useIssues(), { wrapper })

    act(() => {
      result.current.dispatch({ type: 'SET_CURRENT_ISSUE_INDEX', payload: 2 })
    })

    expect(result.current.state.currentIssueIndex).toBe(2)
  })

  it('should set selected view', () => {
    const { result } = renderHook(() => useIssues(), { wrapper })

    act(() => {
      result.current.dispatch({ type: 'SET_SELECTED_VIEW', payload: { id: 'view1', name: 'Test View' } as View })
    })

    expect(result.current.state.selectedView).toEqual({ id: 'view1', name: 'Test View' })
    expect(result.current.state.issues).toEqual([])
    expect(result.current.state.currentIssueIndex).toBe(0)
    expect(result.current.state.nextPage).toBe(null)
    expect(result.current.state.isLoading).toBe(true)
  })

  it('should set next page', () => {
    const { result } = renderHook(() => useIssues(), { wrapper })

    act(() => {
      result.current.dispatch({ type: 'SET_NEXT_PAGE', payload: 'next-page-token' })
    })

    expect(result.current.state.nextPage).toBe('next-page-token')
  })

  it('should set loading state', () => {
    const { result } = renderHook(() => useIssues(), { wrapper })

    act(() => {
      result.current.dispatch({ type: 'SET_LOADING', payload: true })
    })

    expect(result.current.state.isLoading).toBe(true)
  })

  it('should append issues', () => {
    const { result } = renderHook(() => useIssues(), { wrapper })

    act(() => {
      result.current.dispatch({ type: 'SET_ISSUES', payload: [{ id: '1', title: 'First Issue' } as Issue] })
    })

    act(() => {
      result.current.dispatch({ type: 'APPEND_ISSUES', payload: [{ id: '2', title: 'Second Issue' } as Issue] })
    })

    expect(result.current.state.issues).toEqual([
      { id: '1', title: 'First Issue' },
      { id: '2', title: 'Second Issue' }
    ])
  })
})
