import { act, renderHook } from '@testing-library/react-hooks'

import setRoundIssue from '@aces/app/api/set-round-issue'
import useIssueManager from '@aces/lib/hooks/use-issue-manager'


jest.mock('@aces/app/issues/get-issues', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({
    issues: [{ id: 1, title: 'Issue 1' }, { id: 2, title: 'Issue 2' }, { id: 3, title: 'Issue 3' }],
    nextPage: null
  }))
}))
jest.mock('@aces/app/api/set-round-issue')
const mockSetRoundIssue = setRoundIssue as jest.Mock


describe('useIssueManager', () => {
  const mockSelectedView = { id: 1, name: 'View 1' }
  const mockUser = { accessToken: 'token', id: '123', name: 'User' }
  const mockRoundId = 'round1'

  beforeEach(() => {
    jest.useFakeTimers()
    localStorage.setItem('accessToken', 'token')
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should fetch and set issues', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useIssueManager({ selectedView: mockSelectedView, user: mockUser, roundId: mockRoundId })
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.issues).toEqual([])

    await act(async () => {
      jest.runAllTimers()
      await waitForNextUpdate()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.issues).toEqual([
      { id: 1, title: 'Issue 1' },
      { id: 2, title: 'Issue 2' },
      { id: 3, title: 'Issue 3' }
    ])
  })

  it('should handle next and previous issues', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useIssueManager({ selectedView: mockSelectedView, user: mockUser, roundId: mockRoundId })
    )

    await act(async () => {
      jest.runAllTimers()
      await waitForNextUpdate()
    })

    expect(result.current.currentIssueIndex).toBe(0)

    act(() => {
      result.current.handleNextIssue()
    })
    expect(result.current.currentIssueIndex).toBe(1)

    act(() => {
      result.current.handleNextIssue()
    })
    expect(result.current.currentIssueIndex).toBe(2)

    act(() => {
      result.current.handleNextIssue()
    })
    expect(result.current.currentIssueIndex).toBe(2) // Should not exceed the last index

    act(() => {
      result.current.handlePrevIssue()
    })
    expect(result.current.currentIssueIndex).toBe(1)

    act(() => {
      result.current.handlePrevIssue()
    })
    expect(result.current.currentIssueIndex).toBe(0)

    act(() => {
      result.current.handlePrevIssue()
    })
    expect(result.current.currentIssueIndex).toBe(0) // Should not go below 0
  })

  it('should update round issue when currentIssueIndex changes', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useIssueManager({ selectedView: mockSelectedView, user: mockUser, roundId: mockRoundId })
    )

    await act(async () => {
      jest.runAllTimers()
      await waitForNextUpdate()
    })

    expect(setRoundIssue).toHaveBeenCalledWith(mockRoundId, 1)

    act(() => {
      result.current.handleNextIssue()
    })

    expect(setRoundIssue).toHaveBeenCalledWith(mockRoundId, 2)
  })

  it('should reset currentIssueIndex when selectedView changes', async () => {
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ selectedView }) => useIssueManager({ selectedView, user: mockUser, roundId: mockRoundId }),
      { initialProps: { selectedView: mockSelectedView } }
    )

    await act(async () => {
      jest.runAllTimers()
      await waitForNextUpdate()
    })

    act(() => {
      result.current.handleNextIssue()
    })
    expect(result.current.currentIssueIndex).toBe(1)

    rerender({ selectedView: { id: 2, name: 'View 2' } })

    expect(result.current.currentIssueIndex).toBe(0)
  })

  it('should not update round issue when user is null', async () => {
    mockSetRoundIssue.mockClear()
    const { result, waitForNextUpdate } = renderHook(
      ({ selectedView }) => useIssueManager({ selectedView, user: null, roundId: mockRoundId }),
      { initialProps: { selectedView: mockSelectedView } }
    )

    await act(async () => {
      jest.runAllTimers()
      await waitForNextUpdate()
    })

    expect(mockSetRoundIssue).not.toHaveBeenCalled()

    act(() => {
      result.current.handleNextIssue()
    })

    expect(mockSetRoundIssue).not.toHaveBeenCalled()
  })
})
