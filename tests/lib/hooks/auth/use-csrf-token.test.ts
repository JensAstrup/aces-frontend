import { renderHook } from '@testing-library/react'
import { act } from 'react'
import useSWR from 'swr'

import { getCsrfToken, useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


jest.mock('swr')

const mockedUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

describe('getCsrfToken', () => {
  it('should successfully fetch the CSRF token', async () => {
    const mockCsrfToken = 'mock-csrf-token'
    const mockFetchResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ csrfToken: mockCsrfToken }),
    }
    const mockFetch = jest.fn().mockResolvedValue(mockFetchResponse)
    global.fetch = mockFetch

    const result = await getCsrfToken()
    expect(result.csrfToken).toBe(mockCsrfToken)
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/csrf-token`,
      { credentials: 'include' }
    )
    expect(mockFetchResponse.json).toHaveBeenCalled()
  })

  it('should throw an error when fetching the CSRF token fails', async () => {
    const mockFetchResponse = { ok: false }
    const mockFetch = jest.fn().mockResolvedValue(mockFetchResponse)
    global.fetch = mockFetch

    await expect(getCsrfToken()).rejects.toThrow('Failed to fetch CSRF token')
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/csrf-token`,
      { credentials: 'include' }
    )
  })
})

describe('useCsrfToken', () => {
  const mockApiUrl = 'https://api.example.com'

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl
    jest.resetAllMocks()
  })

  it('should return csrfToken when fetch is successful', () => {
    const mockCsrfToken = 'mock-csrf-token'
    mockedUseSWR.mockReturnValue({
      data: { csrfToken: mockCsrfToken },
      error: undefined,
      mutate: jest.fn(),
      isValidating: false,
      isLoading: false
    })

    const { result } = renderHook(() => useCsrfToken())

    expect(result.current.csrfToken).toBe(mockCsrfToken)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBeFalsy()
  })

  it('should handle loading state', () => {
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: jest.fn(),
      isValidating: true,
      isLoading: true
    })

    const { result } = renderHook(() => useCsrfToken())

    expect(result.current.csrfToken).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isError).toBeFalsy()
  })

  it('should handle error state', () => {
    const mockError = new Error('Failed to fetch CSRF token')
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      mutate: jest.fn(),
      isValidating: false,
      isLoading: false
    })

    const { result } = renderHook(() => useCsrfToken())

    expect(result.current.csrfToken).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(mockError)
  })

  it('should call useSWR with correct parameters', () => {
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: jest.fn(),
      isValidating: false,
      isLoading: true
    })

    renderHook(() => useCsrfToken())

    expect(mockedUseSWR).toHaveBeenCalledWith(
      `${mockApiUrl}/auth/csrf-token`,
      expect.any(Function),
      { revalidateOnFocus: false }
    )
  })

  it('should use correct fetcher function', async () => {
    const mockFetchResponse = { json: jest.fn().mockResolvedValue({ csrfToken: 'test-token' }) }
    const mockFetch = jest.fn().mockResolvedValue(mockFetchResponse)
    global.fetch = mockFetch

    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: jest.fn(),
      isValidating: false,
      isLoading: true
    })

    renderHook(() => useCsrfToken())

    const fetcherFunction = mockedUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>

    await act(async () => {
      await fetcherFunction(`${mockApiUrl}/auth/csrf-token`)
    })

    expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/auth/csrf-token`, {
      credentials: 'include',
    })
    expect(mockFetchResponse.json).toHaveBeenCalled()
  })

  it('should handle fetch errors in fetcher function', async () => {
    const mockError = new Error('Fetch failed')
    const mockFetch = jest.fn().mockRejectedValue(mockError)
    global.fetch = mockFetch

    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: jest.fn(),
      isValidating: false,
      isLoading: true
    })

    renderHook(() => useCsrfToken())

    const fetcherFunction = mockedUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>

    await expect(fetcherFunction(`${mockApiUrl}/auth/csrf-token`)).rejects.toThrow('Fetch failed')
  })
})
