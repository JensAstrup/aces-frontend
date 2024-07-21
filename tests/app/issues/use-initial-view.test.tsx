import { renderHook } from '@testing-library/react-hooks'

import { useInitialView } from '@aces/app/issues/use-initial-view'
import { viewsDisplay } from '@aces/app/issues/use-views-display'


describe('useInitialView', () => {
  it('should not call setSelectedView when viewsDisplay is null', () => {
    const { result } = renderHook(() => {
      useInitialView(null)
    })
    expect(result.current).toBeUndefined()
  })

  it('should not call setSelectedView when favoriteViews is empty', () => {
    const mockSetSelectedView = jest.fn()
    const viewsDisplay = {
      favoriteViews: [],
      setSelectedView: mockSetSelectedView,
    } as unknown as viewsDisplay

    renderHook(() => {
      useInitialView(viewsDisplay)
    })

    expect(mockSetSelectedView).not.toHaveBeenCalled()
  })

  it('should call setSelectedView with the first favorite view when favoriteViews is not empty', () => {
    const mockSetSelectedView = jest.fn()
    const viewsDisplay = {
      favoriteViews: ['view1', 'view2'],
      setSelectedView: mockSetSelectedView,
    } as unknown as viewsDisplay

    renderHook(() => {
      useInitialView(viewsDisplay)
    })

    expect(mockSetSelectedView).toHaveBeenCalledTimes(1)
    expect(mockSetSelectedView).toHaveBeenCalledWith('view1')
  })

  it('should not call setSelectedView when favoriteViews or setSelectedView are undefined', () => {
    const mockSetSelectedView = jest.fn()
    const viewsDisplay = {
      favoriteViews: undefined,
      setSelectedView: mockSetSelectedView,
    } as unknown as viewsDisplay

    renderHook(() => {
      useInitialView(viewsDisplay)
    })

    expect(mockSetSelectedView).not.toHaveBeenCalled()

    const viewsDisplay2 = {
      favoriteViews: ['view1'],
      setSelectedView: undefined,
    } as unknown as viewsDisplay

    renderHook(() => {
      useInitialView(viewsDisplay2)
    })

    expect(mockSetSelectedView).not.toHaveBeenCalled()
  })
})
