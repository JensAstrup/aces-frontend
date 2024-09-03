import { renderHook, act } from '@testing-library/react'
import useSWRMutation from 'swr/mutation'

import useVote from '@aces/lib/api/set-vote'


jest.mock('swr/mutation')

const mockedUseSWRMutation = useSWRMutation as jest.MockedFunction<typeof useSWRMutation>

describe('useVote', () => {
  const mockRoundId = 'test-round-id'

  beforeEach(() => {
    jest.resetAllMocks()
    localStorage.clear()
  })

  it('should throw an error when no token is found', async () => {
    const mockError = new Error('Access token not found')
    const mockTrigger = jest.fn().mockRejectedValue(mockError)
    mockedUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      isMutating: false,
      error: mockError,
      reset: jest.fn(),
      data: undefined
    })
    const { result } = renderHook(() => useVote(mockRoundId))

    await act(async () => {
      const { error } = await result.current.trigger({ point: 1, issueId: 'test-issue-id' })
      expect(error).toBe('Access token not found')
    })
  })

  it('should use access token when available', async () => {
    localStorage.setItem('accessToken', 'test-access-token')
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
      await result.current.trigger({ point: 1, issueId: 'test-issue-id' })
    })

    expect(mockTrigger).toHaveBeenCalledWith({ point: 1, issueId: 'test-issue-id' })
  })

  it('should use guest token when access token is not available', async () => {
    localStorage.setItem('guestToken', 'test-guest-token')
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
      await result.current.trigger({ point: 1, issueId: 'test-issue-id' })
    })

    expect(mockTrigger).toHaveBeenCalledWith({ point: 1, issueId: 'test-issue-id' })
  })

  it('should return success when vote is successful', async () => {
    localStorage.setItem('accessToken', 'test-access-token')
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
  })

  it('should return error when vote fails', async () => {
    localStorage.setItem('accessToken', 'test-access-token')
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
    const mockTrigger = jest.fn()
    mockedUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      isMutating: false,
      error: undefined,
      reset: jest.fn(),
      data: undefined
    })
    localStorage.setItem('accessToken', 'test-access-token')
    const { result } = renderHook(() => useVote(mockRoundId))

    await act(async () => {
      const { error } = await result.current.trigger({ point: 0, issueId: '' })
      expect(error).toBe('Point or issueId is missing')
    })
  })

  it('should handle unknown errors', async () => {
    localStorage.setItem('accessToken', 'test-access-token')
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
