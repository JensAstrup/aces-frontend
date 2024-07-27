import { act, renderHook } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'

import useAuth from '@aces/app/oauth/use-authenticate'
import useOAuthRedirect from '@aces/lib/hooks/auth/use-oauth-redirect'
import useCreateRound from '@aces/lib/hooks/rounds/use-create-round'


jest.mock('next/navigation')
jest.mock('@aces/app/oauth/use-authenticate')
jest.mock('@aces/lib/hooks/rounds/use-create-round')

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseCreateRound = useCreateRound as jest.MockedFunction<typeof useCreateRound>

describe('useOAuthRedirect', () => {
  const mockPush = jest.fn()
  const mockGet = jest.fn()
  const mockHandleAuth = jest.fn()
  const mockMutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush } as any)
    mockUseSearchParams.mockReturnValue({ get: mockGet } as any)
    mockUseAuth.mockReturnValue({ handleAuth: mockHandleAuth, isAuthCalled: false })
    mockUseCreateRound.mockReturnValue({
      roundId: undefined,
      isLoading: false,
      isError: undefined,
      mutate: mockMutate,
    })
  })

  it('should not call handleAuth when there is no code', () => {
    mockGet.mockReturnValue(null)
    renderHook(() => useOAuthRedirect())
    expect(mockHandleAuth).not.toHaveBeenCalled()
  })

  it('should call handleAuth when there is a code and auth has not been called', async () => {
    mockGet.mockReturnValue('test-code')
    mockHandleAuth.mockResolvedValue(undefined)
    mockMutate.mockResolvedValue(undefined)

    renderHook(() => useOAuthRedirect())

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockHandleAuth).toHaveBeenCalledWith('test-code')
    expect(mockMutate).toHaveBeenCalled()
  })

  it('should not call handleAuth when auth has already been called', () => {
    mockGet.mockReturnValue('test-code')
    mockUseAuth.mockReturnValue({ handleAuth: mockHandleAuth, isAuthCalled: true })

    renderHook(() => useOAuthRedirect())

    expect(mockHandleAuth).not.toHaveBeenCalled()
  })

  it('should handle authentication failure', async () => {
    mockGet.mockReturnValue('test-code')
    mockHandleAuth.mockRejectedValue(new Error('Auth failed'))
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    renderHook(() => useOAuthRedirect())

    await act(async () => {
      await Promise.resolve()
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith('Authentication failed:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })

  it('should redirect to the round page when roundId is available', () => {
    mockUseCreateRound.mockReturnValue({
      roundId: 'test-round-id',
      isLoading: false,
      isError: undefined,
      mutate: mockMutate,
    })

    renderHook(() => useOAuthRedirect())

    expect(mockPush).toHaveBeenCalledWith('/rounds/test-round-id')
  })

  it('should return correct values', () => {
    mockUseAuth.mockReturnValue({ handleAuth: mockHandleAuth, isAuthCalled: true })
    mockUseCreateRound.mockReturnValue({
      roundId: undefined,
      isLoading: true,
      isError: undefined,
      mutate: mockMutate,
    })

    const { result } = renderHook(() => useOAuthRedirect())

    expect(result.current).toEqual({
      isAuthCalled: true,
      isLoading: true,
      isError: undefined,
    })
  })
})
