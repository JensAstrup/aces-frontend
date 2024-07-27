import { renderHook } from '@testing-library/react'
import useSWR from 'swr'

import User from '@aces/interfaces/user'
import useRegisterViewer from '@aces/lib/hooks/auth/use-register-viewer'


// Mock useSWR
jest.mock('swr')

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

// Define types for our mocked data
interface MockData {
  user: {
    token: string
  }
}

// Create a type that matches the structure of SWRResponse
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
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true
    })
  })

  it('should not fetch when user is defined', () => {
    const mockUser: User = { id: 'test-user', accessToken: 'test-token' }
    // @ts-expect-error Mocking return value as needed for testing
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
    process.env.NEXT_PUBLIC_API_URL = 'http://test-api.com'
    // @ts-expect-error Mocking return value as needed for testing
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
    // @ts-expect-error Mocking return value as needed for testing
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
    // @ts-expect-error Mocking return value as needed for testing
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

  it('should indicate loading state', () => {
    // @ts-expect-error Mocking return value as needed for testing
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: true,
      mutate: jest.fn(),
    } as MockSWRResponse)

    const mockUser: User = { id: 'test', accessToken: 'test-token' }
    const { result } = renderHook(() => useRegisterViewer(mockViewerData, mockUser))

    expect(result.current.isLoading).toBe(true)
  })

  it('should save token to localStorage when data is available', () => {
    const mockData: MockData = { user: { token: 'new-token' } }
    // @ts-expect-error Mocking return value as needed for testing
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
    // @ts-expect-error Mocking return value as needed for testing
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: false,
      mutate: jest.fn(),
    } as MockSWRResponse)

    renderHook(() => useRegisterViewer(mockViewerData, null))

    expect(window.localStorage.setItem).not.toHaveBeenCalled()
  })
})
