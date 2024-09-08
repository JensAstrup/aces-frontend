import * as Sentry from '@sentry/nextjs'
import { renderHook, act } from '@testing-library/react'

import { useToast } from '@aces/components/ui/use-toast'
import { Issue } from '@aces/interfaces/issue'
import useVote from '@aces/lib/api/set-vote'
import useSubmitVote from '@aces/lib/hooks/votes/use-submit-vote'


jest.mock('@sentry/nextjs')
jest.mock('@aces/components/ui/use-toast')
jest.mock('@aces/lib/api/set-vote')

describe('useSubmitVote', () => {
  const mockToast = jest.fn()
  const mockTrigger = jest.fn()
  const mockIsMutating = false
  const mockRoundId = 'test-round-id'

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
    ;(useVote as jest.Mock).mockReturnValue({ trigger: mockTrigger, isMutating: mockIsMutating })
  })

  it('should handle successful vote submission', async () => {
    mockTrigger.mockResolvedValue({})
    const { result } = renderHook(() => useSubmitVote(mockRoundId))

    await act(async () => {
      await result.current.handleVote(5, { id: 'test-issue-id' } as Issue)
    })

    expect(mockTrigger).toHaveBeenCalledWith({ point: 5, issueId: 'test-issue-id' })
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Your vote has been recorded',
      duration: 3000,
    })
  })

  it('should handle vote submission with no issue', async () => {
    const { result } = renderHook(() => useSubmitVote(mockRoundId))

    await act(async () => {
      await result.current.handleVote(5, null)
    })

    expect(Sentry.captureException).toHaveBeenCalledWith(new Error('No issue or issue ID available'))
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Unable to vote: No issue selected',
      duration: 5000,
      variant: 'destructive',
    })
    expect(mockTrigger).not.toHaveBeenCalled()
  })

  it('should handle error from trigger function', async () => {
    mockTrigger.mockResolvedValue({ error: 'Test error' })
    const { result } = renderHook(() => useSubmitVote(mockRoundId))

    await act(async () => {
      await result.current.handleVote(5, { id: 'test-issue-id' } as Issue)
    })

    expect(mockTrigger).toHaveBeenCalledWith({ point: 5, issueId: 'test-issue-id' })
    expect(Sentry.captureException).toHaveBeenCalledWith('Error setting vote')
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'An error occurred while setting the vote',
      duration: 5000,
      variant: 'destructive',
    })
  })

  it('should handle unexpected error during vote submission', async () => {
    mockTrigger.mockRejectedValue(new Error('Unexpected error'))
    const { result } = renderHook(() => useSubmitVote(mockRoundId))

    await act(async () => {
      await result.current.handleVote(5, { id: 'test-issue-id' } as Issue)
    })

    expect(mockTrigger).toHaveBeenCalledWith({ point: 5, issueId: 'test-issue-id' })
    expect(Sentry.captureException).toHaveBeenCalledWith('Error setting vote')
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'An error occurred while setting the vote',
      duration: 5000,
      variant: 'destructive',
    })
  })

  it('should return isMutating from useVote', () => {
    const mockIsMutating = true
    ;(useVote as jest.Mock).mockReturnValue({ trigger: mockTrigger, isMutating: mockIsMutating })

    const { result } = renderHook(() => useSubmitVote(mockRoundId))

    expect(result.current.isMutating).toBe(mockIsMutating)
  })
})
