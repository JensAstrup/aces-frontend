import { renderHook } from '@testing-library/react'
import useSWR from 'swr'

import { View } from '@aces/interfaces/view'
import useGetFavoriteViews from '@aces/lib/api/views/get-favorite-views'


jest.mock('swr')

const mockedUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

describe('useGetFavoriteViews', () => {
  const mockToken = 'mock-token'
  const mockApiUrl = 'https://api.example.com'

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return favorite views when fetch is successful', async () => {
    const mockViews: View[] = [
      { id: '1', name: 'View 1' },
      { id: '2', name: 'View 2' },
    ] as View[]

    // @ts-expect-error Mocking return value as needed for testing
    mockedUseSWR.mockReturnValue({
      data: mockViews,
      error: undefined,
      isLoading: false,
    })

    const { result } = renderHook(() => useGetFavoriteViews(mockToken))

    expect(result.current.favoriteViews).toEqual(mockViews)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBeUndefined()

    expect(mockedUseSWR).toHaveBeenCalledWith(
      [`${mockApiUrl}/views`, mockToken],
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

    const { result } = renderHook(() => useGetFavoriteViews(mockToken))

    expect(result.current.favoriteViews).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isError).toBeUndefined()
  })

  it('should handle error state', () => {
    const mockError = new Error('Failed to fetch')

    // @ts-expect-error Mocking return value as needed for testing
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
    })

    const { result } = renderHook(() => useGetFavoriteViews(mockToken))

    expect(result.current.favoriteViews).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toEqual(mockError)
  })

  it('should call fetcher with correct arguments', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    })
    global.fetch = mockFetch as unknown as typeof fetch

    let capturedFetcher: ((args: [string, string]) => Promise<View[]>) | undefined

    mockedUseSWR.mockImplementation((key, fetcher) => {
      capturedFetcher = fetcher as (args: [string, string]) => Promise<View[]>
      return {
        data: [],
        error: undefined,
        isLoading: false,
      } as any
    })

    renderHook(() => useGetFavoriteViews(mockToken))

    expect(capturedFetcher).toBeDefined()
    if (capturedFetcher) {
      await capturedFetcher([`${mockApiUrl}/views`, mockToken])
    }

    expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/views`, {
      headers: {
        Authorization: mockToken,
      },
    })
  })

  it('should throw an error when fetch fails', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
    })
    global.fetch = mockFetch as unknown as typeof fetch

    let capturedFetcher: ((args: [string, string]) => Promise<View[]>) | undefined

    mockedUseSWR.mockImplementation((key, fetcher) => {
      capturedFetcher = fetcher as (args: [string, string]) => Promise<View[]>
      return {
        data: undefined,
        error: new Error('Failed to fetch favorite views'),
        isLoading: false,
      } as any
    })

    const { result } = renderHook(() => useGetFavoriteViews(mockToken))

    expect(capturedFetcher).toBeDefined()
    if (capturedFetcher) {
      await expect(capturedFetcher([`${mockApiUrl}/views`, mockToken])).rejects.toThrow('Failed to fetch favorite views')
    }

    expect(result.current.isError).toBeInstanceOf(Error)
    expect(result.current.isError?.message).toBe('Failed to fetch favorite views')
  })
})
