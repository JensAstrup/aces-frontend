import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'

import { View } from '@aces/interfaces/view'
import { getViews } from '@aces/lib/api/views/get-favorite-views'
import useViews, { ViewsProvider } from '@aces/lib/hooks/views/views-context'


jest.mock('@aces/lib/api/views/get-favorite-views')

const mockGetViews = getViews as jest.MockedFunction<typeof getViews>

describe('ViewsContext', () => {
  const mockViews = [
    { id: '1', name: 'View 1' },
    { id: '2', name: 'View 2' },
  ] as View[]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with empty views and loading state', () => {
    const { result } = renderHook(() => useViews(), {
      wrapper: ({ children }) => <ViewsProvider>{children}</ViewsProvider>,
    })

    expect(result.current.views).toEqual([])
    expect(result.current.selectedView).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })

  it('should fetch views and set the first view as selected', async () => {
    mockGetViews.mockResolvedValue(mockViews)

    const { result } = renderHook(() => useViews(), {
      wrapper: ({ children }) => <ViewsProvider>{children}</ViewsProvider>,
    })

    await waitFor(() => {
      expect(result.current.views).toEqual(mockViews)
      expect(result.current.selectedView).toEqual(mockViews[0])
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockGetViews).toHaveBeenCalledTimes(1)
  })

  it('should handle empty views array', async () => {
    mockGetViews.mockResolvedValue([])

    const { result } = renderHook(() => useViews(), {
      wrapper: ({ children }) => <ViewsProvider>{children}</ViewsProvider>,
    })

    await waitFor(() => {
      expect(result.current.views).toEqual([])
      expect(result.current.selectedView).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should handle API error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGetViews.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useViews(), {
      wrapper: ({ children }) => <ViewsProvider>{children}</ViewsProvider>,
    })

    await waitFor(() => {
      expect(result.current.views).toEqual([])
      expect(result.current.selectedView).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch views:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })

  it('should update selected view', async () => {
    mockGetViews.mockResolvedValue(mockViews)

    const { result } = renderHook(() => useViews(), {
      wrapper: ({ children }) => <ViewsProvider>{children}</ViewsProvider>,
    })

    await waitFor(() => {
      expect(result.current.selectedView).toEqual(mockViews[0])
    })

    act(() => {
      result.current.setSelectedView(mockViews[1])
    })

    expect(result.current.selectedView).toEqual(mockViews[1])
  })

  it('should throw error when useViews is used outside of ViewsProvider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useViews())).toThrow('useViews must be used within a ViewsProvider')

    consoleErrorSpy.mockRestore()
  })

  it('should select the first view when multiple views are returned', async () => {
    const multipleViews = [...mockViews, { id: '3', name: 'View 3' } as View]
    mockGetViews.mockResolvedValue(multipleViews)

    const { result } = renderHook(() => useViews(), {
      wrapper: ({ children }) => <ViewsProvider>{children}</ViewsProvider>,
    })

    await waitFor(() => {
      expect(result.current.views).toEqual(multipleViews)
      expect(result.current.selectedView).toEqual(multipleViews[0])
      expect(result.current.isLoading).toBe(false)
    })
  })
})
