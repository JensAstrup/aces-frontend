import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import useSWR from 'swr'

import User from '@aces/interfaces/user'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import useCurrentUser, { fetchCurrentUser } from '@aces/lib/hooks/auth/use-current-user'
import { HttpStatusCodes } from '@aces/lib/utils/http-status-codes'


jest.mock('swr')
jest.mock('@aces/lib/hooks/auth/use-csrf-token')

const mockedUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
const mockedUseCsrfToken = useCsrfToken as jest.MockedFunction<typeof useCsrfToken>

describe('fetchCurrentUser', () => {
  const mockApiUrl = 'https://api.example.com'
  const mockCsrfToken = 'mock-csrf-token'
  const mockUser: Partial<User> = { id: '1', displayName: 'Test User', linearId: 'test-linear-id' }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should return user data when fetch is successful', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockUser),
      status: HttpStatusCodes.OK,
    })
    global.fetch = mockFetch as unknown as typeof fetch

    const result = await fetchCurrentUser(`${mockApiUrl}/auth/user`, mockCsrfToken)

    expect(result).toEqual(mockUser)
    expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/auth/user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': mockCsrfToken,
      },
    })
  })

  it('should return null for anonymous users', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      status: HttpStatusCodes.UNAUTHORIZED,
    })
    global.fetch = mockFetch as unknown as typeof fetch

    const result = await fetchCurrentUser(`${mockApiUrl}/auth/user`, mockCsrfToken)

    expect(result).toBeNull()
    expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/auth/user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': mockCsrfToken,
      },
    })
  })
})

describe('useCurrentUser', () => {
  const mockApiUrl = 'https://api.example.com'
  const mockCsrfToken = 'mock-csrf-token'
  const mockUser: Partial<User> = { id: '1', displayName: 'Test User', linearId: 'test-linear-id' }

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl
    mockedUseCsrfToken.mockReturnValue({
      csrfToken: mockCsrfToken,
      isLoading: false,
      isError: false,
    })
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return user data when fetch is successful', async () => {
    mockedUseSWR.mockReturnValue({
      data: mockUser,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    })

    const { result } = renderHook(() => useCurrentUser())

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeUndefined()
    })

    expect(mockedUseSWR).toHaveBeenCalledWith(
      [`${mockApiUrl}/auth/user`, mockCsrfToken],
      expect.any(Function)
    )
  })

  it('should return null for anonymous users', async () => {
    mockedUseSWR.mockReturnValue({
      data: null,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    })

    const { result } = renderHook(() => useCurrentUser())

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeUndefined()
    })

    expect(mockedUseSWR).toHaveBeenCalledWith(
      [`${mockApiUrl}/auth/user`, mockCsrfToken],
      expect.any(Function)
    )
  })

  it('should handle loading state', async () => {
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
      isValidating: false,
    })

    const { result } = renderHook(() => useCurrentUser())

    await waitFor(() => {
      expect(result.current.user).toBeUndefined()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeUndefined()
    })
  })

  it('should handle error state', async () => {
    const mockError = new Error('Failed to fetch user')
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    })

    const { result } = renderHook(() => useCurrentUser())

    await waitFor(() => {
      expect(result.current.user).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toEqual(mockError)
    })
  })

  it('should handle CSRF token loading state', async () => {
    mockedUseCsrfToken.mockReturnValue({
      csrfToken: '',
      isLoading: true,
      isError: false,
    })

    const { result } = renderHook(() => useCurrentUser())

    await waitFor(() => {
      expect(result.current.user).toBeUndefined()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeUndefined()
    })

    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function))
  })

  it('should handle CSRF token error state', async () => {
    mockedUseCsrfToken.mockReturnValue({
      csrfToken: '',
      isLoading: false,
      isError: true,
    })

    const { result } = renderHook(() => useCurrentUser())

    await waitFor(() => {
      expect(result.current.user).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(true)
    })

    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function))
  })

  it('should call fetchCurrentUser with correct arguments', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockUser),
      status: HttpStatusCodes.OK,
    })
    global.fetch = mockFetch as unknown as typeof fetch

    let capturedFetcher: ((args: [string, string]) => Promise<unknown>) | undefined

    mockedUseSWR.mockImplementation((key, fetcher) => {
      capturedFetcher = fetcher as (args: [string, string]) => Promise<unknown>
      return {
        data: mockUser,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
        isValidating: false,
      }
    })

    renderHook(() => useCurrentUser())

    expect(capturedFetcher).toBeDefined()
    await act(async () => {
      await capturedFetcher!([`${mockApiUrl}/auth/user`, mockCsrfToken])
    })

    expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/auth/user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': mockCsrfToken,
      },
    })
  })
})
