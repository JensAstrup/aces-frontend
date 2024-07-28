import { act, renderHook, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import useAuth from '@aces/lib/hooks/auth/use-authenticate'
import useOAuthRedirect from '@aces/lib/hooks/auth/use-oauth-redirect'
import useCreateRound from '@aces/lib/hooks/rounds/use-create-round'


jest.mock('next/navigation')
jest.mock('@aces/lib/hooks/auth/use-authenticate')
jest.mock('@aces/lib/hooks/rounds/use-create-round')

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseCreateRound = useCreateRound as jest.MockedFunction<typeof useCreateRound>

describe('useOAuthRedirect', () => {
  const mockPush = jest.fn()
  const mockGet = jest.fn()
  const mockHandleAuth = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>)
    mockUseSearchParams.mockReturnValue({ get: mockGet } as unknown as ReturnType<typeof useSearchParams>)
    mockUseAuth.mockReturnValue({
      handleAuth: mockHandleAuth,
      isAuthCalled: false
    })
    // @ts-expect-error Only needed for testing purposes
    mockUseCreateRound.mockReturnValue({
      roundId: undefined,
      isLoading: false,
      isError: false,
    })
  })

  it('should not call handleAuth when there is no code', async () => {
    mockGet.mockReturnValue(null)
    renderHook(() => useOAuthRedirect())
    await waitFor(() => {
      expect(mockHandleAuth).not.toHaveBeenCalled()
    })
  })

  it('should call handleAuth when there is a code', async () => {
    mockGet.mockReturnValue('test-code')
    mockHandleAuth.mockResolvedValue(undefined)

    renderHook(() => useOAuthRedirect())

    await waitFor(() => {
      expect(mockHandleAuth).toHaveBeenCalledWith('test-code')
    })
  })

  it('should set shouldCreateRound to true when authentication succeeds and access token is present', async () => {
    mockGet.mockReturnValue('test-code')
    mockHandleAuth.mockResolvedValue(undefined)

    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('mock-access-token'),
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

    const { result } = renderHook(() => useOAuthRedirect())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })
  })

  it('should handle authentication failure', async () => {
    mockGet.mockReturnValue('test-code')
    const mockError = new Error('Auth failed')
    mockHandleAuth.mockRejectedValue(mockError)

    const { result } = renderHook(() => useOAuthRedirect())

    await waitFor(() => {
      expect(result.current.error).toBe(mockError)
    })
  })

  it('should redirect to the round page when roundId is available', async () => {
    // @ts-expect-error Only needed for testing purposes
    mockUseCreateRound.mockReturnValue({
      roundId: 'test-round-id',
      isLoading: false,
      isError: false,
    })

    renderHook(() => useOAuthRedirect())

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/rounds/test-round-id')
    })
  })

  it('should return error when round creation fails', async () => {
    mockGet.mockReturnValue('test-code')
    mockHandleAuth.mockResolvedValue(undefined)
    // @ts-expect-error Only needed for testing purposes
    mockUseCreateRound.mockReturnValue({
      roundId: undefined,
      isLoading: false,
      isError: true,
    })

    const { result } = renderHook(() => useOAuthRedirect())

    await waitFor(() => {
      expect(result.current.error).toEqual(new Error('Failed to create round'))
    })
  })

  it('should return correct loading state', async () => {
    mockGet.mockReturnValue('test-code')
    mockHandleAuth.mockResolvedValue(undefined)
    // @ts-expect-error Only needed for testing purposes
    mockUseCreateRound.mockReturnValue({
      roundId: undefined,
      isLoading: true,
      isError: false,
    })

    const { result } = renderHook(() => useOAuthRedirect())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })
  })
})
