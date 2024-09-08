import * as Sentry from '@sentry/nextjs'
import { act, renderHook } from '@testing-library/react'

import useAuth from '@aces/lib/hooks/auth/use-authenticate'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}))

jest.mock('@aces/lib/hooks/auth/use-csrf-token')
const mockedUseCsrfToken = useCsrfToken as jest.MockedFunction<typeof useCsrfToken>

const mockFetch = global.fetch as jest.Mock

describe('useAuth', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    mockedUseCsrfToken.mockReturnValue({
      csrfToken: 'test-csrf-token',
      isLoading: false,
      isError: false,
    })
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should initialize with isAuthCalled as false', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthCalled).toBe(false)
  })

  it('should set isAuthCalled to true after successful authentication', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' }),
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.handleAuth('test-code')
    })

    expect(result.current.isAuthCalled).toBe(true)
  })

  it('should throw an error if the response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
    })

    const { result } = renderHook(() => useAuth())

    await expect(result.current.handleAuth('test-code')).rejects.toThrow('Failed to exchange code for access token')
  })

  it('should reset authCalledRef if an error occurs', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useAuth())

    await expect(result.current.handleAuth('test-code')).rejects.toThrow('Network error')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' }),
    })

    await act(async () => {
      await result.current.handleAuth('another-code')
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should log errors to Sentry', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Test error'))

    const { result } = renderHook(() => useAuth())

    await expect(result.current.handleAuth('test-code')).rejects.toThrow('Test error')

    expect(Sentry.captureException).toHaveBeenCalledWith(new Error('Test error'))
  })
})
