import { renderHook } from '@testing-library/react'
import useSWR, { SWRResponse } from 'swr'

import User from '@aces/interfaces/user'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import useRegisterViewer from '@aces/lib/hooks/auth/use-register-viewer'


jest.mock('swr')
jest.mock('@aces/lib/hooks/auth/use-csrf-token')

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
const mockUseCsrfToken = useCsrfToken as jest.MockedFunction<typeof useCsrfToken>

interface MockData {
  user: {
    token: string
  }
}

type MockSWRResponse = SWRResponse<MockData | undefined, Error | undefined>

describe('useRegisterViewer', () => {
  const mockViewerData = { roundId: 'test-round' }
  const mockCsrfToken = 'test-csrf-token'

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true
    })
    process.env.NEXT_PUBLIC_API_URL = 'http://test-api.com'
    mockUseCsrfToken.mockReturnValue({
      csrfToken: mockCsrfToken,
      isLoading: false,
      isError: false
    })
  })

  it('should not fetch when user is defined', () => {
    const mockUser: User = { id: 'test-user' }
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    })

    const { result } = renderHook(() => useRegisterViewer(mockViewerData, mockUser))

    expect(mockUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object)
    )
    expect(result.current.isRegistered).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should fetch when user is null and CSRF token is available', () => {
    mockUseSWR.mockReturnValue({
      data: { user: { token: 'new-token' } },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    })

    const { result } = renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(mockUseSWR).toHaveBeenCalledWith(
      ['http://test-api.com/auth/anonymous', mockViewerData, mockCsrfToken],
      expect.any(Function),
      expect.any(Object)
    )
    expect(result.current.isRegistered).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('should not fetch when user is undefined', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    })

    const { result } = renderHook(() => useRegisterViewer(mockViewerData, undefined))

    expect(mockUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object)
    )
    expect(result.current.isRegistered).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle error when fetch fails', () => {
    const mockError = new Error('Fetch failed')
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    })

    const { result } = renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(result.current.isRegistered).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(mockError)
  })

  it('should indicate loading state when isValidating is true', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: true,
      mutate: jest.fn(),
    })

    const { result } = renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(result.current.isLoading).toBe(true)
  })

  it('should indicate loading state when CSRF token is loading', () => {
    mockUseCsrfToken.mockReturnValue({
      csrfToken: null,
      isLoading: true,
      isError: false
    })

    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    })

    const { result } = renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(result.current.isLoading).toBe(true)
  })

  it('should throw an error when fetch response is not ok', async () => {
    const mockResponse = { ok: false }
    const mockFetch = jest.fn().mockResolvedValue(mockResponse)
    global.fetch = mockFetch as unknown as typeof fetch

    let capturedFetcher: ((...args: unknown[]) => unknown) | undefined

    // @ts-expect-error Mocking return value as needed for testing
    mockUseSWR.mockImplementation((key, fetcher) => {
      if (Array.isArray(key) && typeof fetcher === 'function') {
        capturedFetcher = fetcher
      }
      return {
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as MockSWRResponse
    })

    renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(capturedFetcher).toBeDefined()
    await expect(capturedFetcher!('http://test-api.com/auth/anonymous', mockViewerData, mockCsrfToken)).rejects.toThrow('Failed to register viewer')
  })
})
