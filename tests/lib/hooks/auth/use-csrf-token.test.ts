import { renderHook } from '@testing-library/react'
import { act } from 'react'
import useSWR from 'swr'

import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


jest.mock('swr')

const mockedUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

describe('useCsrfToken', () => {
  const mockApiUrl = 'https://api.example.com'

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl
    jest.resetAllMocks()
  })

  it('should return csrf token when fetch is successful', () => {
    const mockCsrfToken = 'mock-csrf-token'
    // @ts-expect-error We don't need to fully mock here
    mockedUseSWR.mockReturnValue({
      data: { csrfToken: mockCsrfToken },
      error: undefined,
    })

    const { result } = renderHook(() => useCsrfToken())

    expect(result.current.csrfToken).toBe(mockCsrfToken)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBeUndefined()
  })

  it('should handle loading state', () => {
    // @ts-expect-error We don't need to fully mock here
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
    })

    const { result } = renderHook(() => useCsrfToken())

    expect(result.current.csrfToken).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isError).toBeUndefined()
  })

  it('should handle error state', () => {
    const mockError = new Error('Failed to fetch CSRF token')
    // @ts-expect-error We don't need to fully mock here
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
    })

    const { result } = renderHook(() => useCsrfToken())

    expect(result.current.csrfToken).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(mockError)
  })

  it('should call useSWR with correct parameters', () => {
    renderHook(() => useCsrfToken())

    expect(mockedUseSWR).toHaveBeenCalledWith(
      `${mockApiUrl}/auth/csrf-token`,
      expect.any(Function)
    )
  })

  it('should use correct fetcher function', async () => {
    const mockFetch = jest.fn()
    global.fetch = mockFetch

    renderHook(() => useCsrfToken())

    const fetcherFunction = mockedUseSWR.mock.calls[0][1]
    await act(async () => {
      await fetcherFunction!(`${mockApiUrl}/auth/csrf-token`)
    })

    expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/auth/csrf-token`, {
      credentials: 'include',
    })
  })
})
