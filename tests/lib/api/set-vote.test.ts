import { renderHook, act } from '@testing-library/react'
import useSWRMutation from 'swr/mutation'

import useVote, { useVoteFetcher } from '@aces/lib/api/set-vote'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


jest.mock('swr/mutation')
jest.mock('@aces/lib/hooks/auth/use-csrf-token')

const mockedUseSWRMutation = useSWRMutation as jest.MockedFunction<typeof useSWRMutation>
const mockedUseCsrfToken = useCsrfToken as jest.MockedFunction<typeof useCsrfToken>

describe('useVoteFetcher', () => {
  const mockUrl = 'test-url'
  const mockArgs = { point: 1, issueId: 'test-issue-id', csrfToken: 'test-csrf-token' }

  it('should return success when vote is successful', async () => {
    const mockResponse = { success: true }
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse)
    })
    global.fetch = mockFetch

    const result = useVoteFetcher(mockUrl, { arg: mockArgs })

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(mockUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': mockArgs.csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({ vote: mockArgs.point, issueId: mockArgs.issueId }),
    })
  })

  it('should throw an error when vote fails', async () => {
    const mockError = { message: 'Failed to vote' }
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue(mockError)
    })
    global.fetch = mockFetch

    await expect(useVoteFetcher(mockUrl, { arg: mockArgs })).rejects.toThrow('Failed to vote')
  })
})

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

  it('should throw an error when issueId is missing', async () => {
    const { result } = renderHook(() => useVote(mockRoundId))

    await act(async () => {
      const { error } = await result.current.trigger({ point: 0, issueId: '' })
      expect(error).toBe('issueId is missing')
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
