import { act, renderHook } from '@testing-library/react'
import React from 'react'

import { View } from '@aces/interfaces/view'
import useViews, { ViewsProvider } from '@aces/lib/hooks/views/views-context'


describe('ViewsContext', () => {
  const mockViews = [
    { id: '1', name: 'View 1' },
    { id: '2', name: 'View 2' },
  ] as View[]

  it('should initialize with provided views and select the first view', () => {
    const { result } = renderHook(() => useViews(), {
      wrapper: ({ children }) => <ViewsProvider views={mockViews}>{children}</ViewsProvider>,
    })

    expect(result.current.views).toEqual(mockViews)
    expect(result.current.selectedView).toEqual(mockViews[0])
  })

  it('should initialize with empty views and null selected view when no views are provided', () => {
    const { result } = renderHook(() => useViews(), {
      wrapper: ({ children }) => <ViewsProvider views={[]}>{children}</ViewsProvider>,
    })

    expect(result.current.views).toEqual([])
    expect(result.current.selectedView).toBeNull()
  })

  it('should update selected view', () => {
    const { result } = renderHook(() => useViews(), {
      wrapper: ({ children }) => <ViewsProvider views={mockViews}>{children}</ViewsProvider>,
    })

    act(() => {
      result.current.setView(mockViews[1])
    })

    expect(result.current.selectedView).toEqual(mockViews[1])
  })

  it('should throw error when useViews is used outside of ViewsProvider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useViews())).toThrow('useViews must be used within a ViewsProvider')

    consoleErrorSpy.mockRestore()
  })

  it('should not throw error when useViews is used within ViewsProvider', () => {
    expect(() =>
      renderHook(() => useViews(), {
        wrapper: ({ children }) => <ViewsProvider views={mockViews}>{children}</ViewsProvider>,
      })
    ).not.toThrow()
  })

  it('should maintain selected view when it exists in the provided views', () => {
    const { result } = renderHook(() => useViews(), {
      wrapper: ({ children }) => <ViewsProvider views={mockViews}>{children}</ViewsProvider>,
    })

    act(() => {
      result.current.setView(mockViews[1])
    })

    expect(result.current.selectedView).toEqual(mockViews[1])
  })
})
