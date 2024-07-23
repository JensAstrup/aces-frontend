import { act, renderHook } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'

import useOAuthRedirect from '@aces/app/oauth/callback/oauth-redirect'
import useAuth from '@aces/app/oauth/use-authenticate'
import createRound from '@aces/app/rounds/createRound'


jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}))

jest.mock('@aces/app/oauth/use-authenticate', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@aces/app/rounds/createRound', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('useOAuthRedirect', () => {
  let mockRouter: { push: jest.Mock }
  let mockSearchParams: URLSearchParams
  let mockHandleAuth: jest.Mock
  let mockIsAuthCalled: boolean
  let mockCreateRound: jest.Mock

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter)

    mockSearchParams = new URLSearchParams();
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)

    mockHandleAuth = jest.fn()
    mockIsAuthCalled = false;
    (useAuth as jest.Mock).mockReturnValue({ handleAuth: mockHandleAuth, isAuthCalled: mockIsAuthCalled })

    mockCreateRound = jest.fn();
    (createRound as jest.Mock).mockImplementation(mockCreateRound)

    process.env.NEXT_PUBLIC_API_URL = 'http://test-api.com'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should not call handleAuth when there is no code', () => {
    renderHook(() => useOAuthRedirect())
    expect(mockHandleAuth).not.toHaveBeenCalled()
  })

  it('should call handleAuth when there is a code', async () => {
    mockSearchParams.append('code', 'test-code')
    mockHandleAuth.mockResolvedValueOnce(undefined)
    mockCreateRound.mockResolvedValueOnce('test-round-id')

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      renderHook(() => useOAuthRedirect())
    })

    expect(mockHandleAuth).toHaveBeenCalledWith('test-code')
    expect(mockCreateRound).toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith('/rounds/test-round-id')
  })

  it('should handle handleAuth error', async () => {
    mockSearchParams.append('code', 'test-code')
    mockHandleAuth.mockRejectedValueOnce(new Error('Auth error'))

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      renderHook(() => useOAuthRedirect())
    })

    expect(mockHandleAuth).toHaveBeenCalledWith('test-code')
    expect(consoleErrorSpy).toHaveBeenCalledWith('Authentication failed:', expect.any(Error))
    expect(mockCreateRound).not.toHaveBeenCalled()
    expect(mockRouter.push).not.toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should handle createRound error', async () => {
    mockSearchParams.append('code', 'test-code')
    mockHandleAuth.mockResolvedValueOnce(undefined)
    mockCreateRound.mockRejectedValueOnce(new Error('Create round error'))

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      renderHook(() => useOAuthRedirect())
    })

    expect(mockHandleAuth).toHaveBeenCalledWith('test-code')
    expect(mockCreateRound).toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith('Authentication failed:', expect.any(Error))
    expect(mockRouter.push).not.toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should not call handleAuth multiple times for the same code', async () => {
    mockSearchParams.append('code', 'test-code')
    mockHandleAuth.mockResolvedValueOnce(undefined)
    mockCreateRound.mockResolvedValueOnce('test-round-id');
    (useAuth as jest.Mock).mockReturnValue({ handleAuth: mockHandleAuth, isAuthCalled: true })

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      renderHook(() => useOAuthRedirect())
    })

    expect(mockHandleAuth).not.toHaveBeenCalled()
    expect(mockCreateRound).not.toHaveBeenCalled()
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
})
