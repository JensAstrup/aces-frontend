import { renderHook } from '@testing-library/react'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import useCreateRound from '@aces/lib/hooks/rounds/use-create-round'


jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
}))
jest.mock('swr')

const mockedUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
const mockedUseState = useState as jest.MockedFunction<typeof useState>
const mockedUseEffect = useEffect as jest.MockedFunction<typeof useEffect>

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

    mockedUseState.mockReturnValue([mockAccessToken, jest.fn()])
    mockedUseEffect.mockImplementation(cb => cb())
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

    const { result } = renderHook(() => useCreateRound())

    expect(result.current.roundId).toBe(mockRoundId)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBeUndefined()
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

    const { result } = renderHook(() => useCreateRound())

    expect(result.current.roundId).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isError).toBeUndefined()
  })

  it('should handle error state', () => {
    const mockError = new Error('Failed to create round')
    // @ts-expect-error Only needed for testing purposes
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      mutate: jest.fn(),
    })

    const { result } = renderHook(() => useCreateRound())

    expect(result.current.roundId).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(mockError)
  })

  it('should store roundId in localStorage', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
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

    renderHook(() => useCreateRound())

    expect(capturedFetcher).toBeDefined()
    if (capturedFetcher) {
      await capturedFetcher(`${mockApiUrl}/rounds`, mockAccessToken)
    }

    expect(localStorage.setItem).toHaveBeenCalledWith('round', mockRoundId)
  })

  it('should return mutate function', () => {
    const mockMutate = jest.fn()
    // @ts-expect-error Only needed for testing purposes
    mockedUseSWR.mockReturnValue({
      data: mockRoundId,
      error: undefined,
      mutate: mockMutate,
    })

    const { result } = renderHook(() => useCreateRound())

    expect(result.current.mutate).toBe(mockMutate)
  })

  it('should set accessToken from localStorage on mount', () => {
    const setAccessToken = jest.fn()
    mockedUseState.mockReturnValueOnce([null, setAccessToken])

    renderHook(() => useCreateRound())

    expect(localStorage.getItem).toHaveBeenCalledWith('accessToken')
    expect(setAccessToken).toHaveBeenCalledWith(mockAccessToken)
  })

  it('should not call useSWR when accessToken is null', () => {
    mockedUseState.mockReturnValueOnce([null, jest.fn()])
    // @ts-expect-error - ignore for testing purposes
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: jest.fn(),
    })

    renderHook(() => useCreateRound())

    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
  })
})
