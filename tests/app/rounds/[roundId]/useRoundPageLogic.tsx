import { renderHook } from '@testing-library/react-hooks'

import useRoundPageLogic from '@aces/app/rounds/[roundId]/useRoundPageLogic'


jest.mock('@aces/lib/hooks/use-views-display')
jest.mock('@aces/lib/hooks/user-context')
jest.mock('@aces/lib/hooks/use-register-viewer')
jest.mock('@aces/lib/hooks/use-current-issue')

const mockUseViewsDisplay = jest.requireMock('@aces/lib/hooks/use-views-display').default
const mockUseUser = jest.requireMock('@aces/lib/hooks/user-context').useUser
const mockUseRegisterViewer = jest.requireMock('@aces/lib/hooks/use-register-viewer').default
const mockUseCurrentIssue = jest.requireMock('@aces/lib/hooks/use-current-issue').default

describe('useRoundPageLogic', () => {
  const mockRoundId = 'test-round-id'

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseViewsDisplay.mockReturnValue({
      favoriteViews: [],
      setSelectedView: jest.fn(),
    })
    mockUseUser.mockReturnValue({ user: null, isLoading: false })
    mockUseRegisterViewer.mockReturnValue()
    mockUseCurrentIssue.mockReturnValue({ currentIssue: null, isLoading: false })
  })

  it('should return the correct structure', () => {
    const { result } = renderHook(() => useRoundPageLogic(mockRoundId))

    expect(result.current).toEqual({
      user: null,
      isUserLoading: false,
      viewsDisplay: expect.any(Object),
      currentIssue: null,
      isIssueLoading: false,
    })
  })

  it('should call useRegisterViewer with correct arguments', () => {
    const mockUser = { id: 'test-user-id' }
    mockUseUser.mockReturnValue({ user: mockUser, isLoading: false })

    renderHook(() => useRoundPageLogic(mockRoundId))

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: mockRoundId }, mockUser)
  })

  it('should not call setSelectedView when there are no favorite views', () => {
    const mockSetSelectedView = jest.fn()
    mockUseViewsDisplay.mockReturnValue({
      favoriteViews: [],
      setSelectedView: mockSetSelectedView,
    })

    renderHook(() => useRoundPageLogic(mockRoundId))

    expect(mockSetSelectedView).not.toHaveBeenCalled()
  })

  it('should call setSelectedView with the first favorite view when available', () => {
    const mockSetSelectedView = jest.fn()
    const mockFavoriteViews = [{ id: 'view1' }, { id: 'view2' }]
    mockUseViewsDisplay.mockReturnValue({
      favoriteViews: mockFavoriteViews,
      setSelectedView: mockSetSelectedView,
    })

    renderHook(() => useRoundPageLogic(mockRoundId))

    expect(mockSetSelectedView).toHaveBeenCalledWith(mockFavoriteViews[0])
  })

  it('should call useCurrentIssue with correct arguments', () => {
    const mockUser = { id: 'test-user-id' }
    const mockViewsDisplay = { favoriteViews: [], setSelectedView: jest.fn() }
    mockUseUser.mockReturnValue({ user: mockUser, isLoading: false })
    mockUseViewsDisplay.mockReturnValue(mockViewsDisplay)

    renderHook(() => useRoundPageLogic(mockRoundId))

    expect(mockUseCurrentIssue).toHaveBeenCalledWith({
      roundId: mockRoundId,
      user: mockUser,
      viewsDisplay: mockViewsDisplay,
    })
  })

  it('should handle loading states correctly', () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: true })
    mockUseCurrentIssue.mockReturnValue({ currentIssue: null, isLoading: true })

    const { result } = renderHook(() => useRoundPageLogic(mockRoundId))

    expect(result.current.isUserLoading).toBe(true)
    expect(result.current.isIssueLoading).toBe(true)
  })
})
