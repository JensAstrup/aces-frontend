import { renderHook } from '@testing-library/react'
import useSWR from 'swr'

import useSetRoundIssue, { setRoundIssueFetcher } from '@aces/lib/hooks/rounds/use-set-round-issue'


jest.mock('swr')

const mockedUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

describe('useSetRoundIssue', () => {
  const mockApiUrl = 'https://api.example.com'
  const mockRoundId = 'round-1'
  const mockIssueId = 'issue-1'
  const mockAccessToken = 'mock-access-token'

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(mockAccessToken)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return data when fetch is successful', () => {
    const mockData = { success: true }
    // @ts-expect-error Mocking return value as needed for testing
    mockedUseSWR.mockReturnValue({
      data: mockData,
      error: undefined,
      isLoading: false,
    })

    const { result } = renderHook(() => useSetRoundIssue(mockRoundId, mockIssueId))

    expect(result.current.data).toEqual(mockData)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()

    expect(mockedUseSWR).toHaveBeenCalledWith(
      [`${mockApiUrl}/rounds/${mockRoundId}/issue`, mockIssueId, mockAccessToken],
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

    const { result } = renderHook(() => useSetRoundIssue(mockRoundId, mockIssueId))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeUndefined()
  })

  it('should handle error state', () => {
    const mockError = new Error('Failed to set issue')
    // @ts-expect-error Mocking return value as needed for testing
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
    })

    const { result } = renderHook(() => useSetRoundIssue(mockRoundId, mockIssueId))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toEqual(mockError)
  })

  it('should not fetch when roundId is empty', () => {
    const { result } = renderHook(() => useSetRoundIssue('', mockIssueId))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function))
  })

  it('should not fetch when issueId is empty', () => {
    const { result } = renderHook(() => useSetRoundIssue(mockRoundId, ''))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function))
  })

  it('should not fetch when access token is not found', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

    const { result } = renderHook(() => useSetRoundIssue(mockRoundId, mockIssueId))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function))
  })
})

describe('setRoundIssueFetcher', () => {
  const mockApiUrl = 'https://api.example.com'
  const mockRoundId = 'round-1'
  const mockIssueId = 'issue-1'
  const mockAccessToken = 'mock-access-token'

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should make a POST request with correct parameters', async () => {
    const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ success: true }) }
    const mockFetch = jest.fn().mockResolvedValue(mockResponse)
    global.fetch = mockFetch as unknown as typeof fetch

    await setRoundIssueFetcher(`${mockApiUrl}/rounds/${mockRoundId}/issue`, mockIssueId, mockAccessToken)

    expect(mockFetch).toHaveBeenCalledWith(
      `${mockApiUrl}/rounds/${mockRoundId}/issue`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': mockAccessToken
        },
        body: JSON.stringify({ issue: mockIssueId })
      }
    )
  })

  it('should return JSON response when fetch is successful', async () => {
    const mockResponseData = { success: true }
    const mockResponse = { ok: true, json: jest.fn().mockResolvedValue(mockResponseData) }
    const mockFetch = jest.fn().mockResolvedValue(mockResponse)
    global.fetch = mockFetch as unknown as typeof fetch

    const result = await setRoundIssueFetcher(`${mockApiUrl}/rounds/${mockRoundId}/issue`, mockIssueId, mockAccessToken)

    expect(result).toEqual(mockResponseData)
  })

  it('should throw an error when fetch fails', async () => {
    const mockResponse = { ok: false }
    const mockFetch = jest.fn().mockResolvedValue(mockResponse)
    global.fetch = mockFetch as unknown as typeof fetch

    await expect(setRoundIssueFetcher(`${mockApiUrl}/rounds/${mockRoundId}/issue`, mockIssueId, mockAccessToken))
      .rejects.toThrow('Failed to set issue')
  })
})
