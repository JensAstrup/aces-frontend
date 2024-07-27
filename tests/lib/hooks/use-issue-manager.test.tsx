import { act, renderHook } from '@testing-library/react-hooks'

import { View } from '@aces/interfaces/view'
import setRoundIssue from '@aces/lib/api/set-round-issue'
import useIssueManager from '@aces/lib/hooks/use-issue-manager'
import { useSelectedView } from '@aces/lib/hooks/use-selected-view'


jest.mock('@aces/lib/hooks/use-selected-view')
jest.mock('@aces/lib/api/set-round-issue')

const mockUseSelectedView = useSelectedView as jest.Mock
const mockSetRoundIssue = setRoundIssue as jest.Mock

describe('useIssueManager', () => {
  const mockUser = { id: 'user1', accessToken: 'token123' }
  const mockRoundId = 'round1'
  const mockView = { id: 'view1', name: 'Test View' } as unknown as View
  const mockIssues = [
    { id: 'issue1', title: 'Issue 1' },
    { id: 'issue2', title: 'Issue 2' },
    { id: 'issue3', title: 'Issue 3' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSelectedView.mockImplementation((setIsLoading, _view, _issues, setIssues) => {
      setIsLoading(false)
      setIssues(mockIssues)
    })
    mockSetRoundIssue.mockResolvedValue(undefined)
  })

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useIssueManager({ selectedView: mockView, user: mockUser, roundId: mockRoundId }))

    expect(result.current.issues).toEqual(mockIssues)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.currentIssueIndex).toBe(0)
  })

  it('should handle next issue correctly', () => {
    const { result } = renderHook(() => useIssueManager({ selectedView: mockView, user: mockUser, roundId: mockRoundId }))

    act(() => {
      result.current.handleNextIssue()
    })

    expect(result.current.currentIssueIndex).toBe(1)
  })

  it('should handle previous issue correctly', () => {
    const { result } = renderHook(() => useIssueManager({ selectedView: mockView, user: mockUser, roundId: mockRoundId }))

    act(() => {
      result.current.handleNextIssue()
      result.current.handleNextIssue()
      result.current.handlePrevIssue()
    })

    expect(result.current.currentIssueIndex).toBe(1)
  })

  it('should not go below 0 index when handling previous issue', () => {
    const { result } = renderHook(() => useIssueManager({ selectedView: mockView, user: mockUser, roundId: mockRoundId }))

    act(() => {
      result.current.handlePrevIssue()
    })

    expect(result.current.currentIssueIndex).toBe(0)
  })

  it('should not go above max index when handling next issue', () => {
    const { result } = renderHook(() => useIssueManager({ selectedView: mockView, user: mockUser, roundId: mockRoundId }))

    act(() => {
      result.current.handleNextIssue()
      result.current.handleNextIssue()
      result.current.handleNextIssue()
      result.current.handleNextIssue()
    })

    expect(result.current.currentIssueIndex).toBe(2)
  })

  it('should call setRoundIssue when currentIssueIndex changes', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useIssueManager({ selectedView: mockView, user: mockUser, roundId: mockRoundId }))

    act(() => {
      result.current.handleNextIssue()
    })

    await waitForNextUpdate()

    expect(mockSetRoundIssue).toHaveBeenCalledWith(mockRoundId, 'issue2')
  })

  it('should reset currentIssueIndex to 0 when selectedView changes', () => {
    const { result, rerender } = renderHook(
      ({ view }) => useIssueManager({ selectedView: view, user: mockUser, roundId: mockRoundId }),
      { initialProps: { view: mockView } }
    )

    act(() => {
      result.current.handleNextIssue()
    })

    expect(result.current.currentIssueIndex).toBe(1)

    rerender({ view: { ...mockView, id: 123 } })

    expect(result.current.currentIssueIndex).toBe(0)
  })

  it('should not call setRoundIssue when user is null', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useIssueManager({ selectedView: mockView, user: null, roundId: mockRoundId }))

    act(() => {
      result.current.handleNextIssue()
    })

    await waitForNextUpdate()

    expect(mockSetRoundIssue).not.toHaveBeenCalled()
  })
})
