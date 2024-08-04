import { act, renderHook } from '@testing-library/react'
import React from 'react'

import { VotesProvider, useVotes } from '@aces/lib/hooks/votes/use-votes'


describe('useVotes', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <VotesProvider>{children}</VotesProvider>
  )

  it('should initialize with empty votes and zero expected votes', () => {
    const { result } = renderHook(() => useVotes(), { wrapper })

    expect(result.current.votes).toEqual([])
    expect(result.current.expectedVotes).toBe(0)
  })

  it('should update votes', () => {
    const { result } = renderHook(() => useVotes(), { wrapper })

    act(() => {
      result.current.setVotes([1, 2, 3])
    })

    expect(result.current.votes).toEqual([1, 2, 3])
  })

  it('should update expected votes', () => {
    const { result } = renderHook(() => useVotes(), { wrapper })

    act(() => {
      result.current.setExpectedVotes(5)
    })

    expect(result.current.expectedVotes).toBe(5)
  })

  it('should throw an error when used outside of VotesProvider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useVotes())).toThrow('useVotes must be used within a VotesProvider')

    consoleErrorSpy.mockRestore()
  })

  it('should maintain separate state for multiple hooks', () => {
    const { result: result1 } = renderHook(() => useVotes(), { wrapper })
    const { result: result2 } = renderHook(() => useVotes(), { wrapper })

    act(() => {
      result1.current.setVotes([1, 2])
      result1.current.setExpectedVotes(3)
    })

    act(() => {
      result2.current.setVotes([4, 5, 6])
      result2.current.setExpectedVotes(4)
    })

    expect(result1.current.votes).toEqual([1, 2])
    expect(result1.current.expectedVotes).toBe(3)
    expect(result2.current.votes).toEqual([4, 5, 6])
    expect(result2.current.expectedVotes).toBe(4)
  })

  it('should use the same setExpectedVotes function on re-renders', () => {
    const { result, rerender } = renderHook(() => useVotes(), { wrapper })

    const initialSetExpectedVotes = result.current.setExpectedVotes

    rerender()

    expect(result.current.setExpectedVotes).toBe(initialSetExpectedVotes)
  })
})
