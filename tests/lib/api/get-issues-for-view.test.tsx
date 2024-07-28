import { renderHook } from '@testing-library/react'
import useSWR from 'swr'

import { View } from '@aces/interfaces/view'
import useGetIssuesForView from '@aces/lib/api/get-issues-for-view'


jest.mock('swr')

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
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(mockAccessToken)
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
    expect(result.current.error).toBeUndefined()

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
    expect(result.current.error).toBeUndefined()
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
    expect(result.current.isLoading).toBeUndefined()
    expect(result.current.error).toBeUndefined()
    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function))
  })

  it('should throw an error when access token is not found', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useGetIssuesForView(mockView))
    }).toThrow('No access token found')

    consoleErrorSpy.mockRestore()
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
      headers: {
        Authorization: mockAccessToken,
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
