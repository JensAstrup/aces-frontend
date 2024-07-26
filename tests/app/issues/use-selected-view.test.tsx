import { act, renderHook } from '@testing-library/react-hooks'
import React from 'react'

import { Issue } from '@aces/app/interfaces/issue'
import { View } from '@aces/app/issues/get-favorite-views'
import getIssues from '@aces/app/issues/get-issues'
import { useSelectedView } from '@aces/app/issues/use-selected-view'



jest.mock('@aces/app/issues/get-issues')
const mockGetIssues = getIssues as jest.Mock

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
      useSelectedView(setIsLoading, null, [], setIssues, null, jest.fn(), 0)
    })

    expect(getIssues).not.toHaveBeenCalled()
    expect(setIsLoading).not.toHaveBeenCalled()
    expect(setIssues).not.toHaveBeenCalled()
  })

  it('should call getIssues and update state when selectedView is provided', async () => {
    const mockView: View = { id: 1, name: 'Test View' }
    const mockIssues: Issue[] = [{ id: 1, title: 'Test Issue' } as Issue]
    const mockApiResult = { issues: mockIssues, nextPage: 'http://example.com/issues?page=2' }
    mockGetIssues.mockResolvedValue(mockApiResult)

    renderHook(() => {
      useSelectedView(setIsLoading, mockView, [], setIssues, null, jest.fn(), 0)
    })

    expect(setIsLoading).toHaveBeenCalledWith(true)
    expect(getIssues).toHaveBeenCalledWith(mockView, null)

    await act(async () => {
      await Promise.resolve()
    })

    expect(setIssues).toHaveBeenCalledTimes(2)
    expect(setIssues).toHaveBeenNthCalledWith(1, [])
    expect(setIssues).toHaveBeenNthCalledWith(2, expect.any(Function))
    expect(setIsLoading).toHaveBeenCalledWith(false)
  })

  it('should handle errors when fetching issues fails', async () => {
    const mockView: View = { id: 1, name: 'Test View' }
    const mockError = new Error('Failed to fetch');
    (getIssues).mockRejectedValue(mockError)

    console.error = jest.fn()

    renderHook(() => {
      useSelectedView(setIsLoading, mockView, [], setIssues, null, jest.fn(), 0)
    })

    expect(setIsLoading).toHaveBeenCalledWith(true)
    expect(getIssues).toHaveBeenCalledWith(mockView, null)

    await act(async () => {
      await Promise.resolve()
    })

    expect(console.error).toHaveBeenCalledWith('Failed to fetch issues:', mockError)
    expect(setIsLoading).toHaveBeenCalledWith(false)
    expect(setIssues).toHaveBeenCalledWith([])
  })

  it('should not call getIssues again if selectedView has not changed', () => {
    const mockView: View = { id: 1, name: 'Test View' }
    const { rerender } = renderHook(
      ({ view }: { view: View | null }) => {
        useSelectedView(setIsLoading, view, [], setIssues, null, jest.fn(), 0)
      },
      { initialProps: { view: mockView } }
    )

    expect(getIssues).toHaveBeenCalledTimes(1)

    rerender({ view: mockView })

    expect(getIssues).toHaveBeenCalledTimes(1)
  })
})
