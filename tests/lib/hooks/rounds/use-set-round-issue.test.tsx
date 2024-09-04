import { renderHook } from '@testing-library/react'
import useSWR from 'swr'

import useSetRoundIssue, { setRoundIssueFetcher } from '@aces/lib/hooks/rounds/use-set-round-issue'
import { HttpStatusCodes } from '@aces/lib/utils/http-status-codes'


jest.mock('swr')

const mockedUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': mockAccessToken
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

  it('should return null when response has no content', async () => {
    const mockResponse = { ok: true, status: HttpStatusCodes.NO_CONTENT }
    const mockFetch = jest.fn().mockResolvedValue(mockResponse)
    global.fetch = mockFetch as unknown as typeof fetch

    const result = await setRoundIssueFetcher(`${mockApiUrl}/rounds/${mockRoundId}/issue`, mockIssueId, mockAccessToken)

    expect(result).toBeNull()
  })

  it('should throw an error when fetch fails', async () => {
    const mockResponse = { ok: false }
    const mockFetch = jest.fn().mockResolvedValue(mockResponse)
    global.fetch = mockFetch as unknown as typeof fetch

    await expect(setRoundIssueFetcher(`${mockApiUrl}/rounds/${mockRoundId}/issue`, mockIssueId, mockAccessToken))
      .rejects.toThrow('Failed to set issue')
  })
})

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
    mockedUseSWR.mockReturnValue({
      data: mockData,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
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
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
      isValidating: false,
    })

    const { result } = renderHook(() => useSetRoundIssue(mockRoundId, mockIssueId))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeUndefined()
  })

  it('should handle error state', () => {
    const mockError = new Error('Failed to set issue')
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    })

    const { result } = renderHook(() => useSetRoundIssue(mockRoundId, mockIssueId))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toEqual(mockError)
  })

  it('should not fetch when roundId is empty', () => {
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    })
    const { result } = renderHook(() => useSetRoundIssue('', mockIssueId))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function))
  })

  it('should not fetch when issueId is empty', () => {
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    })
    const { result } = renderHook(() => useSetRoundIssue(mockRoundId, ''))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function))
  })

  it('should not fetch when access token is not found', () => {
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    })
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

    const { result } = renderHook(() => useSetRoundIssue(mockRoundId, mockIssueId))

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
    expect(mockedUseSWR).toHaveBeenCalledWith(null, expect.any(Function))
  })
})
