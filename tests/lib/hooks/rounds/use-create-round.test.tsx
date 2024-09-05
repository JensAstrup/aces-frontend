import { act, renderHook } from '@testing-library/react'
import useSWR from 'swr'

import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import useCreateRound from '@aces/lib/hooks/rounds/use-create-round'


jest.mock('swr')
jest.mock('@aces/lib/hooks/auth/use-csrf-token')

const mockedUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
const mockedUseCsrfToken = useCsrfToken as jest.MockedFunction<typeof useCsrfToken>

describe('useCreateRound', () => {
  const mockApiUrl = 'https://api.example.com'
  const mockCsrfToken = 'mock-csrf-token'
  const mockRoundId = 'round-123'

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})

    mockedUseCsrfToken.mockReturnValue({
      csrfToken: mockCsrfToken,
      isLoading: false,
      isError: false,
    })

    // @ts-expect-error We don't need to fully mock here
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
    // @ts-expect-error We don't need to fully mock here
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
      [`${mockApiUrl}/rounds`, mockCsrfToken],
      expect.any(Function),
      { revalidateOnFocus: false, shouldRetryOnError: false }
    )
  })

  it('should handle loading state', () => {
    // @ts-expect-error We don't need to fully mock here
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
    // @ts-expect-error We don't need to fully mock here
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

    let capturedFetcher: ((args: [string, string]) => Promise<string>) | undefined

    // @ts-expect-error We don't need to fully mock here
    mockedUseSWR.mockImplementation((key, fetcher) => {
      capturedFetcher = fetcher as (args: [string, string]) => Promise<string>
      return {
        data: mockRoundId,
        error: undefined,
        mutate: jest.fn(),
      }
    })

    renderHook(() => useCreateRound(true))

    expect(capturedFetcher).toBeDefined()
    if (capturedFetcher) {
      await act(async () => {
        await capturedFetcher!([`${mockApiUrl}/rounds`, mockCsrfToken])
      })
    }

    expect(localStorage.setItem).toHaveBeenCalledWith('round', mockRoundId)
    expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/rounds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': mockCsrfToken,
      },
      credentials: 'include',
    })
  })

  it('should throw an error when fetch fails', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
    })
    global.fetch = mockFetch as unknown as typeof fetch

    let capturedFetcher: ((args: [string, string]) => Promise<string>) | undefined

    // @ts-expect-error We don't need to fully mock here
    mockedUseSWR.mockImplementation((key, fetcher) => {
      capturedFetcher = fetcher as (args: [string, string]) => Promise<string>
      return {
        data: undefined,
        error: undefined,
        mutate: jest.fn(),
      }
    })

    renderHook(() => useCreateRound(true))

    expect(capturedFetcher).toBeDefined()
    await expect(capturedFetcher!([`${mockApiUrl}/rounds`, mockCsrfToken])).rejects.toThrow('Failed to create round')
  })

  it('should return mutate function', () => {
    const mockMutate = jest.fn()
    // @ts-expect-error We don't need to fully mock here
    mockedUseSWR.mockReturnValue({
      data: mockRoundId,
      error: undefined,
      mutate: mockMutate,
    })

    const { result } = renderHook(() => useCreateRound(true))

    expect(result.current.mutate).toBe(mockMutate)
  })

  it('should handle CSRF token loading state', () => {
    mockedUseCsrfToken.mockReturnValue({
      csrfToken: null,
      isLoading: true,
      isError: false,
    })

    const { result } = renderHook(() => useCreateRound(true))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isError).toBe(false)
  })

  it('should handle CSRF token error state', () => {
    mockedUseCsrfToken.mockReturnValue({
      csrfToken: null,
      isLoading: false,
      isError: true,
    })

    const mockMutate = jest.fn()
    // @ts-expect-error We don't need to fully mock here
    mockedUseSWR.mockReturnValue({
      data: mockRoundId,
      error: undefined,
      mutate: mockMutate,
    })

    const { result } = renderHook(() => useCreateRound(true))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(true)
  })
})
