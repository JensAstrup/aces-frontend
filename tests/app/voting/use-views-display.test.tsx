import { act, renderHook } from '@testing-library/react-hooks'

import getFavoriteViews from '@aces/app/voting/get-favorite-views'
import useViewsDisplay from '@aces/app/voting/use-views-display'


jest.mock('@aces/app/voting/get-favorite-views')
const mockGetFavoriteViews = getFavoriteViews as jest.Mock

describe('useViewsDisplay', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
  }
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null while loading', () => {
    localStorageMock.getItem.mockReturnValue('mock-token')
    mockGetFavoriteViews.mockImplementation(() => new Promise(() => {})) // Never resolves

    const { result } = renderHook(() => useViewsDisplay())

    expect(result.current).toBe(null)
  })

  it('should fetch and set favorite views', async () => {
    const mockViews = [{ id: 1, name: 'View 1' }, { id: 2, name: 'View 2' }]
    localStorageMock.getItem.mockReturnValue('mock-token')
    mockGetFavoriteViews.mockResolvedValue(mockViews)

    const { result, waitForNextUpdate } = renderHook(() => useViewsDisplay())

    await waitForNextUpdate()

    expect(result.current).toEqual({
      selectedView: null,
      setSelectedView: expect.any(Function),
      favoriteViews: mockViews
    })
  })

  it('should handle error when fetching favorite views', async () => {
    localStorageMock.getItem.mockReturnValue('mock-token')
    mockGetFavoriteViews.mockRejectedValue(new Error('Fetch error'))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const { result, waitForNextUpdate } = renderHook(() => useViewsDisplay())

    await waitForNextUpdate()

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching favorite views:', expect.any(Error))
    expect(result.current).toEqual({
      selectedView: null,
      setSelectedView: expect.any(Function),
      favoriteViews: []
    })

    consoleSpy.mockRestore()
  })


  it('should update selectedView when setSelectedView is called', async () => {
    localStorageMock.getItem.mockReturnValue('mock-token')
    mockGetFavoriteViews.mockResolvedValue([])

    const { result, waitForNextUpdate } = renderHook(() => useViewsDisplay())

    await waitForNextUpdate()

    act(() => {
      result.current!.setSelectedView({ id: 1, name: 'Selected View' })
    })

    expect(result.current!.selectedView).toEqual({ id: 1, name: 'Selected View' })
  })
})
