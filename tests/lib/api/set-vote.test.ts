import { renderHook, act } from '@testing-library/react'
import useSWRMutation from 'swr/mutation'

import useVote from '@aces/lib/api/set-vote'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


jest.mock('swr/mutation')
jest.mock('@aces/lib/hooks/auth/use-csrf-token')

const mockedUseSWRMutation = useSWRMutation as jest.MockedFunction<typeof useSWRMutation>
const mockedUseCsrfToken = useCsrfToken as jest.MockedFunction<typeof useCsrfToken>

describe('useVote', () => {
  const mockRoundId = 'test-round-id'
  const mockCsrfToken = 'test-csrf-token'

  beforeEach(() => {
    jest.resetAllMocks()
    mockedUseCsrfToken.mockReturnValue({
      csrfToken: mockCsrfToken,
      isLoading: false,
      isError: false,
    })

    // Ensure useSWRMutation always returns an object with a trigger function
    mockedUseSWRMutation.mockReturnValue({
      trigger: jest.fn(),
      isMutating: false,
      error: undefined,
      reset: jest.fn(),
      data: undefined
    })
  })

  it('should return error when CSRF token is not ready', async () => {
    mockedUseCsrfToken.mockReturnValue({
      csrfToken: null,
      isLoading: true,
      isError: false,
    })

    const { result } = renderHook(() => useVote(mockRoundId))

    await act(async () => {
      const { error } = await result.current.trigger({ point: 1, issueId: 'test-issue-id' })
      expect(error).toBe('CSRF token is not ready or failed to load')
    })
  })

  it('should return success when vote is successful', async () => {
    const mockTrigger = jest.fn().mockResolvedValue({ success: true })
    mockedUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      isMutating: false,
      error: undefined,
      reset: jest.fn(),
      data: undefined
    })

    const { result } = renderHook(() => useVote(mockRoundId))

    await act(async () => {
      const { success } = await result.current.trigger({ point: 1, issueId: 'test-issue-id' })
      expect(success).toBe(true)
    })

    expect(mockTrigger).toHaveBeenCalledWith({ point: 1, issueId: 'test-issue-id', csrfToken: mockCsrfToken })
  })

  it('should return error when vote fails', async () => {
    const mockError = new Error('Failed to vote')
    const mockTrigger = jest.fn().mockRejectedValue(mockError)
    mockedUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      isMutating: false,
      error: undefined,
      reset: jest.fn(),
      data: undefined
    })

    const { result } = renderHook(() => useVote(mockRoundId))

    await act(async () => {
      const { error } = await result.current.trigger({ point: 1, issueId: 'test-issue-id' })
      expect(error).toBe('Failed to vote')
    })
  })

  it('should throw an error when point or issueId is missing', async () => {
    const { result } = renderHook(() => useVote(mockRoundId))

    await act(async () => {
      const { error } = await result.current.trigger({ point: 0, issueId: '' })
      expect(error).toBe('Point or issueId is missing')
    })
  })

  it('should handle unknown errors', async () => {
    const mockTrigger = jest.fn().mockRejectedValue('Unknown error')
    mockedUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      isMutating: false,
      error: undefined,
      reset: jest.fn(),
      data: undefined
    })

    const { result } = renderHook(() => useVote(mockRoundId))

    await act(async () => {
      const { error } = await result.current.trigger({ point: 1, issueId: 'test-issue-id' })
      expect(error).toBe('An unknown error occurred')
    })
  })
})
