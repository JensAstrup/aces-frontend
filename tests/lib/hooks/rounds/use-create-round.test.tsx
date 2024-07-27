import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import useSWR from 'swr'

import useCreateRound from '@aces/lib/hooks/rounds/use-create-round'


jest.mock('swr')

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

describe('useCreateRound', () => {
  const mockFetch = jest.fn()
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  }

  beforeEach(() => {
    jest.resetAllMocks()
    global.fetch = mockFetch as unknown as typeof global.fetch
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })
    process.env.NEXT_PUBLIC_API_URL = 'http://test-api.com'
  })

  it('should throw an error when no access token is found', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    // @ts-expect-error Mocking return value as needed for testing
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: new Error('No access token found'),
      mutate: jest.fn()
    })

    const { result } = renderHook(() => useCreateRound())

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect(result.current.isError).toEqual(new Error('No access token found'))
  })

  it('should create a round successfully', async () => {
    const mockAccessToken = 'mock-access-token'
    const mockRoundId = 'mock-round-id'
    mockLocalStorage.getItem.mockReturnValue(mockAccessToken)
    // @ts-expect-error Mocking return value as needed for testing
    mockUseSWR.mockReturnValue({
      data: mockRoundId,
      error: undefined,
      mutate: jest.fn()
    })

    const { result } = renderHook(() => useCreateRound())

    await waitFor(() => {
      expect(result.current.roundId).toBe(mockRoundId)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(undefined)
  })

  it('should handle API errors', async () => {
    const mockAccessToken = 'mock-access-token'
    mockLocalStorage.getItem.mockReturnValue(mockAccessToken)
    // @ts-expect-error Mocking return value as needed for testing
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: new Error('API Error'),
      mutate: jest.fn()
    })

    const { result } = renderHook(() => useCreateRound())

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect(result.current.isError).toEqual(new Error('API Error'))
  })

  it('should return loading state', () => {
    mockLocalStorage.getItem.mockReturnValue('mock-access-token')
    // @ts-expect-error Mocking return value as needed for testing
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: jest.fn()
    })

    const { result } = renderHook(() => useCreateRound())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.roundId).toBeUndefined()
    expect(result.current.isError).toBe(undefined)
  })

  it('should allow manual revalidation', async () => {
    const mockRoundId = 'mock-round-id'
    const mockMutate = jest.fn()
    mockLocalStorage.getItem.mockReturnValue('mock-access-token')
    // @ts-expect-error Mocking return value as needed for testing
    mockUseSWR.mockReturnValue({
      data: mockRoundId,
      error: undefined,
      mutate: mockMutate
    })

    const { result } = renderHook(() => useCreateRound())

    await waitFor(() => {
      expect(result.current.roundId).toBe(mockRoundId)
    })

    act(() => {
      result.current.mutate()
    })

    expect(mockMutate).toHaveBeenCalledTimes(1)
  })
})
