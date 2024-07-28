import { renderHook } from '@testing-library/react'
import useSWR from 'swr'

import User from '@aces/interfaces/user'
import useRegisterViewer from '@aces/lib/hooks/auth/use-register-viewer'


jest.mock('swr')

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

interface MockData {
  user: {
    token: string
  }
}

type MockSWRResponse = {
  data: MockData | undefined
  error: Error | undefined
  isValidating: boolean
  mutate: (data?: MockData | Promise<MockData> | undefined) => Promise<MockData | undefined>
}

describe('useRegisterViewer', () => {
  const mockViewerData = { roundId: 'test-round' }

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
  })

  it('should not fetch when user is defined', () => {
    const mockUser: User = { id: 'test-user', accessToken: 'test-token' }
    // @ts-expect-error Only needed for testing purposes
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: false,
      mutate: jest.fn(),
    } as MockSWRResponse)

    const { result } = renderHook(() => useRegisterViewer(mockViewerData, mockUser))

    expect(mockUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object)
    )
    expect(result.current.isRegistered).toBe(false)
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('should fetch when user is null', () => {
    // @ts-expect-error Only needed for testing purposes
    mockUseSWR.mockReturnValue({
      data: { user: { token: 'new-token' } },
      error: undefined,
      isValidating: false,
      mutate: jest.fn(),
    } as MockSWRResponse)

    const { result } = renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(mockUseSWR).toHaveBeenCalledWith(
      ['http://test-api.com/auth/anonymous', mockViewerData],
      expect.any(Function),
      expect.any(Object)
    )
    expect(result.current.isRegistered).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('should not fetch when user is undefined', () => {
    // @ts-expect-error Only needed for testing purposes
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: false,
      mutate: jest.fn(),
    } as MockSWRResponse)

    const { result } = renderHook(() => useRegisterViewer(mockViewerData, undefined))

    expect(mockUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object)
    )
    expect(result.current.isRegistered).toBe(false)
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('should handle error when fetch fails', () => {
    const mockError = new Error('Fetch failed')
    // @ts-expect-error Only needed for testing purposes
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isValidating: false,
      mutate: jest.fn(),
    } as MockSWRResponse)

    const { result } = renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(result.current.isRegistered).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(mockError)
  })

  it('should indicate loading state when isValidating is true', () => {
    // @ts-expect-error Only needed for testing purposes
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: true,
      mutate: jest.fn(),
    } as MockSWRResponse)

    const { result } = renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(result.current.isLoading).toBe(true)
  })

  it('should save token to localStorage when data is available', () => {
    const mockData: MockData = { user: { token: 'new-token' } }
    // @ts-expect-error Only needed for testing purposes
    mockUseSWR.mockReturnValue({
      data: mockData,
      error: undefined,
      isValidating: false,
      mutate: jest.fn(),
    } as MockSWRResponse)

    renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(window.localStorage.setItem).toHaveBeenCalledWith('guestToken', 'new-token')
  })

  it('should not save token to localStorage when data is not available', () => {
    // @ts-expect-error Only needed for testing purposes
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: false,
      mutate: jest.fn(),
    } as MockSWRResponse)

    renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(window.localStorage.setItem).not.toHaveBeenCalled()
  })

  it('should not save token to localStorage when data is available but does not contain a user token', () => {
    const mockData = { user: {} }
    // @ts-expect-error Only needed for testing purposes
    mockUseSWR.mockReturnValue({
      data: mockData,
      error: undefined,
      isValidating: false,
      mutate: jest.fn(),
    } as MockSWRResponse)

    renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(window.localStorage.setItem).not.toHaveBeenCalled()
  })

  it('should handle fetcher function correctly', async () => {
    const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ user: { token: 'test-token' } }) }
    const mockFetch = jest.fn().mockResolvedValue(mockResponse)
    global.fetch = mockFetch as unknown as typeof fetch

    let capturedFetcher: (([url, data]: [string, unknown]) => Promise<unknown>) | undefined

    // @ts-expect-error Only needed for testing purposes
    mockUseSWR.mockImplementation((key, fetcher) => {
      if (Array.isArray(key) && typeof fetcher === 'function') {
        // @ts-expect-error Only needed for testing purposes
        capturedFetcher = fetcher
      }
      return {
        data: undefined,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
      }
    })

    renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(capturedFetcher).toBeDefined()
    if (capturedFetcher) {
      await capturedFetcher(['http://test-api.com/auth/anonymous', mockViewerData])
    }

    expect(mockFetch).toHaveBeenCalledWith('http://test-api.com/auth/anonymous', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockViewerData),
    })
  })

  it('should throw an error when fetch response is not ok', async () => {
    const mockResponse = { ok: false }
    const mockFetch = jest.fn().mockResolvedValue(mockResponse)
    global.fetch = mockFetch as unknown as typeof fetch

    let capturedFetcher: (([url, data]: [string, unknown]) => Promise<unknown>) | undefined

    // @ts-expect-error Only needed for testing purposes
    mockUseSWR.mockImplementation((key, fetcher) => {
      if (Array.isArray(key) && typeof fetcher === 'function') {
        // @ts-expect-error Only needed for testing purposes
        capturedFetcher = fetcher
      }
      return {
        data: undefined,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
      }
    })

    renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(capturedFetcher).toBeDefined()
    await expect(capturedFetcher!(['http://test-api.com/auth/anonymous', mockViewerData])).rejects.toThrow('Failed to register viewer')
  })
})
