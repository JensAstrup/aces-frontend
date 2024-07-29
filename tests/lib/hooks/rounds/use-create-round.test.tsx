import { act, renderHook } from '@testing-library/react'
import useSWR from 'swr'

import useCreateRound from '@aces/lib/hooks/rounds/use-create-round'


jest.mock('swr')

const mockedUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

describe('useCreateRound', () => {
  const mockApiUrl = 'https://api.example.com'
  const mockAccessToken = 'mock-access-token'
  const mockRoundId = 'round-123'

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'accessToken') return mockAccessToken
      return null
    })
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})

    // @ts-expect-error Only needed for testing purposes
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: jest.fn(),
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return roundId when fetch is successful', () => {
    // @ts-expect-error Only needed for testing purposes
    mockedUseSWR.mockReturnValue({
      data: mockRoundId,
      error: undefined,
      mutate: jest.fn(),
    })

    const { result } = renderHook(() => useCreateRound(true))

    expect(result.current.roundId).toBe(mockRoundId)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(mockedUseSWR).toHaveBeenCalledWith(
      [`${mockApiUrl}/rounds`, mockAccessToken],
      expect.any(Function),
      { revalidateOnFocus: false, shouldRetryOnError: false }
    )
  })

  it('should handle loading state', () => {
    // @ts-expect-error Only needed for testing purposes
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: jest.fn(),
    })

    const { result } = renderHook(() => useCreateRound(true))

    expect(result.current.roundId).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isError).toBe(false)
  })

  it('should handle error state', () => {
    const mockError = new Error('Failed to create round')
    // @ts-expect-error Only needed for testing purposes
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      mutate: jest.fn(),
    })

    const { result } = renderHook(() => useCreateRound(true))

    expect(result.current.roundId).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(true)
  })

  it('should not fetch when shouldFetch is false', () => {
    const { result } = renderHook(() => useCreateRound(false))

    expect(result.current.roundId).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
  })

  it('should store roundId in localStorage when fetcher is called', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: mockRoundId }),
    })
    global.fetch = mockFetch as unknown as typeof fetch

    let capturedFetcher: ((url: string, accessToken: string) => Promise<string>) | undefined

    // @ts-expect-error Only needed for testing purposes
    mockedUseSWR.mockImplementation((key, fetcher) => {
      capturedFetcher = fetcher as (url: string, accessToken: string) => Promise<string>
      return {
        data: mockRoundId,
        error: undefined,
        mutate: jest.fn(),
      }
    })

    renderHook(() => useCreateRound(true))

    expect(capturedFetcher).toBeDefined()
    await act(async () => {
      await capturedFetcher!(`${mockApiUrl}/rounds`, mockAccessToken)
    })

    expect(localStorage.setItem).toHaveBeenCalledWith('round', mockRoundId)
  })

  it('should throw an error when fetch fails', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
    })
    global.fetch = mockFetch as unknown as typeof fetch

    let capturedFetcher: ((url: string, accessToken: string) => Promise<string>) | undefined

    // @ts-expect-error Only needed for testing purposes
    mockedUseSWR.mockImplementation((key, fetcher) => {
      capturedFetcher = fetcher as (url: string, accessToken: string) => Promise<string>
      return {
        data: undefined,
        error: undefined,
        mutate: jest.fn(),
      }
    })

    renderHook(() => useCreateRound(true))

    expect(capturedFetcher).toBeDefined()
    await expect(capturedFetcher!(`${mockApiUrl}/rounds`, mockAccessToken)).rejects.toThrow('Failed to create round')
  })

  it('should return mutate function', () => {
    const mockMutate = jest.fn()
    // @ts-expect-error Only needed for testing purposes
    mockedUseSWR.mockReturnValue({
      data: mockRoundId,
      error: undefined,
      mutate: mockMutate,
    })

    const { result } = renderHook(() => useCreateRound(true))

    expect(result.current.mutate).toBe(mockMutate)
  })
})
