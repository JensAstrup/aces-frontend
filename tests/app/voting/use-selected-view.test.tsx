import { act, renderHook } from '@testing-library/react-hooks'
import React from 'react'

import { View } from '@aces/app/voting/get-favorite-views'
import getIssues, { Issue } from '@aces/app/voting/use-get-issues'
import { useSelectedView } from '@aces/app/voting/use-selected-view'



jest.mock('@aces/app/voting/use-get-issues')

describe('useSelectedView', () => {
  let setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  let setIssues: React.Dispatch<React.SetStateAction<Issue[]>>

  beforeEach(() => {
    setIsLoading = jest.fn() as React.Dispatch<React.SetStateAction<boolean>>
    setIssues = jest.fn() as React.Dispatch<React.SetStateAction<Issue[]>>
    jest.clearAllMocks()
  })

  it('should not call getIssues when selectedView is null', () => {
    renderHook(() => {
      useSelectedView(setIsLoading, null, setIssues)
    })

    expect(getIssues).not.toHaveBeenCalled()
    expect(setIsLoading).not.toHaveBeenCalled()
    expect(setIssues).not.toHaveBeenCalled()
  })

  it('should call getIssues and update state when selectedView is provided', async () => {
    const mockView: View = { id: 1, name: 'Test View' }
    const mockIssues: Issue[] = [{ id: 1, title: 'Test Issue' } as Issue];
    (getIssues as jest.MockedFunction<typeof getIssues>).mockResolvedValue(mockIssues)

    renderHook(() => {
      useSelectedView(setIsLoading, mockView, setIssues)
    })

    expect(setIsLoading).toHaveBeenCalledWith(true)
    expect(getIssues).toHaveBeenCalledWith(mockView)

    await act(async () => {
      await Promise.resolve()
    })

    expect(setIssues).toHaveBeenCalledWith(mockIssues)
    expect(setIsLoading).toHaveBeenCalledWith(false)
  })

  it('should handle errors when fetching issues fails', async () => {
    const mockView: View = { id: 1, name: 'Test View' }
    const mockError = new Error('Failed to fetch');
    (getIssues as jest.MockedFunction<typeof getIssues>).mockRejectedValue(mockError)

    console.error = jest.fn()

    renderHook(() => {
      useSelectedView(setIsLoading, mockView, setIssues)
    })

    expect(setIsLoading).toHaveBeenCalledWith(true)
    expect(getIssues).toHaveBeenCalledWith(mockView)

    await act(async () => {
      await Promise.resolve()
    })

    expect(console.error).toHaveBeenCalledWith('Failed to fetch issues:', mockError)
    expect(setIsLoading).toHaveBeenCalledWith(false)
    expect(setIssues).not.toHaveBeenCalled()
  })

  it('should not call getIssues again if selectedView has not changed', () => {
    const mockView: View = { id: 1, name: 'Test View' }
    const { rerender } = renderHook(
      ({ view }: { view: View | null }) => {
        useSelectedView(setIsLoading, view, setIssues)
      },
      { initialProps: { view: mockView } }
    )

    expect(getIssues).toHaveBeenCalledTimes(1)

    rerender({ view: mockView })

    expect(getIssues).toHaveBeenCalledTimes(1)
  })
})
