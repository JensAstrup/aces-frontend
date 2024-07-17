import { act, renderHook } from '@testing-library/react-hooks'
import { useRouter, useSearchParams } from 'next/navigation'

import useOAuthRedirect from '@aces/app/oauth/callback/oauth-redirect'


jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),

}))

describe('useOAuthRedirect', () => {
  let mockRouter: { push: jest.Mock }
  let mockSearchParams: URLSearchParams
  let mockFetch: jest.Mock
  let mockLocalStorage: { setItem: jest.Mock }

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter)

    mockSearchParams = new URLSearchParams();
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)

    mockFetch = jest.fn()
    global.fetch = mockFetch as unknown as typeof fetch

    mockLocalStorage = {
      setItem: jest.fn(),
    }
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
    })

    process.env.NEXT_PUBLIC_API_URL = 'http://test-api.com'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should not call fetch when there is no code', () => {
    renderHook(() => useOAuthRedirect())
    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('should call fetch when there is a code', async () => {
    mockSearchParams.append('code', 'test-code')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' }),
    })

    let hookResult: { result: { current: { isAuthCalled: boolean } } } | undefined


    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      hookResult = renderHook(() => useOAuthRedirect())
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.com/auth',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ code: 'test-code' }),
      })
    )
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', 'test-token')
    expect(mockRouter.push).toHaveBeenCalledWith('/issue')
    expect(hookResult?.result.current.isAuthCalled).toBe(true)
  })

  test('should handle fetch error', () => {
    mockSearchParams.append('code', 'test-code')
    mockFetch.mockRejectedValueOnce(new Error('Fetch error'))

    console.error = jest.fn()

    let hookResult: { result: { current: { isAuthCalled: boolean } } } | undefined


    act(() => {
      hookResult = renderHook(() => useOAuthRedirect())
    })

    expect(console.error).toHaveBeenCalled()
    expect(hookResult?.result.current.isAuthCalled).toBe(true)
  })

  test('should handle non-ok response', () => {
    mockSearchParams.append('code', 'test-code')
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Auth failed' }),
    })

    console.error = jest.fn()

    let hookResult: { result: { current: { isAuthCalled: boolean } } } | undefined


    act(() => {
      hookResult = renderHook(() => useOAuthRedirect())
    })

    expect(console.error).toHaveBeenCalled()
    expect(hookResult?.result.current.isAuthCalled).toBe(true)
  })

  test('should not call fetch multiple times for the same code', () => {
    mockSearchParams.append('code', 'test-code')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' }),
    })

    act(() => {
      renderHook(() => useOAuthRedirect())
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})
