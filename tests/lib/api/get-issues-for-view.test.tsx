import { renderHook } from '@testing-library/react'
import useSWR from 'swr'

import { View } from '@aces/interfaces/view'
import useGetIssuesForView from '@aces/lib/api/get-issues-for-view'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


jest.mock('swr')
jest.mock('@aces/lib/hooks/auth/use-csrf-token')
const mockedUseCsrfToken = useCsrfToken as jest.MockedFunction<typeof useCsrfToken>

const mockedUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

describe('useGetIssuesForView', () => {
  const mockApiUrl = 'https://api.example.com'
  const mockAccessToken = 'mock-access-token'
  const mockView: View = { id: 'view-1', name: 'Test View' } as View
  const mockIssues = [
    { id: '1', title: 'Issue 1' },
    { id: '2', title: 'Issue 2' },
  ]

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl
    mockedUseCsrfToken.mockReturnValue({
      csrfToken: mockAccessToken,
      isLoading: false,
      isError: false,
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return issues when fetch is successful', () => {
    // @ts-expect-error Mocking return value as needed for testing
    mockedUseSWR.mockReturnValue({
      data: mockIssues,
      error: undefined,
      isLoading: false,
    })

    const { result } = renderHook(() => useGetIssuesForView(mockView))

    expect(result.current.data).toEqual(mockIssues)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(false)

    expect(mockedUseSWR).toHaveBeenCalledWith(
      [`${mockApiUrl}/views/${mockView.id}/issues`, mockAccessToken],
      expect.any(Function)
    )
  })

  it('should handle loading state', () => {
    // @ts-expect-error Mocking return value as needed for testing
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    const { result } = renderHook(() => useGetIssuesForView(mockView))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toEqual(false)
  })

  it('should handle error state', () => {
    const mockError = new Error('Failed to fetch issues')
    // @ts-expect-error Mocking return value as needed for testing
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
    })

    const { result } = renderHook(() => useGetIssuesForView(mockView))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toEqual(mockError)
  })

  it('should not fetch when selectedView is null', () => {
    const { result } = renderHook(() => useGetIssuesForView(null))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toEqual(false)
    expect(result.current.error).toBe(false)
    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function))
  })

  it('should call fetcher with correct arguments', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockIssues),
    })
    global.fetch = mockFetch as unknown as typeof fetch

    let capturedFetcher: ((args: [string, string]) => Promise<unknown>) | undefined

    // @ts-expect-error Mocking return value as needed for testing
    mockedUseSWR.mockImplementation((key, fetcher) => {
      capturedFetcher = fetcher as (args: [string, string]) => Promise<unknown>
      return {
        data: mockIssues,
        error: undefined,
        isLoading: false,
      }
    })

    renderHook(() => useGetIssuesForView(mockView))

    expect(capturedFetcher).toBeDefined()
    if (capturedFetcher) {
      await capturedFetcher([`${mockApiUrl}/views/${mockView.id}/issues`, mockAccessToken])
    }

    expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/views/${mockView.id}/issues`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': mockAccessToken,
      },
    })
  })

  it('should throw an error when fetch fails', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
    })
    global.fetch = mockFetch as unknown as typeof fetch

    let capturedFetcher: ((args: [string, string]) => Promise<unknown>) | undefined

    // @ts-expect-error Mocking return value as needed for testing
    mockedUseSWR.mockImplementation((key, fetcher) => {
      capturedFetcher = fetcher as (args: [string, string]) => Promise<unknown>
      return {
        data: undefined,
        error: new Error('An error occurred while fetching the data.'),
        isLoading: false,
      }
    })

    const { result } = renderHook(() => useGetIssuesForView(mockView))

    await expect(capturedFetcher!([`${mockApiUrl}/views/${mockView.id}/issues`, mockAccessToken])).rejects.toThrow('An error occurred while fetching the data.')

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('An error occurred while fetching the data.')
  })
})
