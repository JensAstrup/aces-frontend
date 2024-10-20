import { renderHook } from '@testing-library/react'
import useSWR, { SWRResponse } from 'swr'

import { Issue } from '@aces/interfaces/issue'
import Team from '@aces/interfaces/team'
import { getCsrfToken, useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import useGetIssuesForTeam, { fetchIssuesForTeam } from '@aces/lib/hooks/issues/get-issues-for-team'


jest.mock('swr')
jest.mock('@aces/lib/hooks/auth/use-csrf-token')

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
const mockUseCsrfToken = useCsrfToken as jest.MockedFunction<typeof useCsrfToken>
const mockGetCsrfToken = getCsrfToken as jest.MockedFunction<typeof getCsrfToken>

describe('useGetIssuesForTeam', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>
    mockUseCsrfToken.mockReturnValue({
      csrfToken: 'mock-csrf-token',
      isLoading: false,
      isError: false,
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('should return initial state when no team is selected', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    } as unknown as SWRResponse)

    const { result } = renderHook(() => useGetIssuesForTeam(null))

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeFalsy()
    expect(result.current.isLoading).toBe(false)
  })

  it('should fetch issues when a team is selected', () => {
    const mockTeam: Team = { id: 'team1', name: 'Test Team' }
    const mockIssues: Issue[] = [{ id: 'issue1', title: 'Test Issue' } as Issue]

    mockUseSWR.mockReturnValue({
      data: { issues: mockIssues },
      error: undefined,
      isLoading: false,
    } as unknown as SWRResponse)

    const { result } = renderHook(() => useGetIssuesForTeam(mockTeam))

    expect(result.current.data).toEqual({ issues: mockIssues })
    expect(result.current.error).toBeFalsy()
    expect(result.current.isLoading).toBe(false)
    expect(mockUseSWR).toHaveBeenCalledWith(
      [`api/issues/teams/${mockTeam.id}`, 'mock-csrf-token'],
      expect.any(Function)
    )
  })

  it('should handle fetch errors', () => {
    const mockTeam: Team = { id: 'team1', name: 'Test Team' }
    const mockError = new Error('Fetch error')

    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
    } as unknown as SWRResponse)

    const { result } = renderHook(() => useGetIssuesForTeam(mockTeam))

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBe(mockError)
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle CSRF token loading state', () => {
    mockUseCsrfToken.mockReturnValue({
      csrfToken: '',
      isLoading: true,
      isError: false,
    })

    const mockTeam: Team = { id: 'team1', name: 'Test Team' }
    const { result } = renderHook(() => useGetIssuesForTeam(mockTeam))

    expect(result.current.isLoading).toBe(true)
  })

  it('should handle CSRF token error state', () => {
    mockUseCsrfToken.mockReturnValue({
      csrfToken: '',
      isLoading: false,
      isError: true,
    })

    const mockTeam: Team = { id: 'team1', name: 'Test Team' }
    const { result } = renderHook(() => useGetIssuesForTeam(mockTeam))

    expect(result.current.error).toBeTruthy()
  })
})

describe('fetchIssuesForTeam', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('should fetch issues for a team successfully', async () => {
    const mockTeamId = 'team1'
    const mockIssues: Issue[] = [{ id: 'issue1', title: 'Test Issue' } as Issue]
    const mockCsrfToken = 'mock-csrf-token'

    mockGetCsrfToken.mockResolvedValue({ csrfToken: mockCsrfToken })
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ issues: mockIssues }),
    } as unknown as Response)

    const result = await fetchIssuesForTeam(mockTeamId)

    expect(result).toEqual({ issues: mockIssues })
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/issues/teams/${mockTeamId}`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': mockCsrfToken,
        },
        credentials: 'include',
      })
    )
  })

  it('should throw an error when fetch fails', async () => {
    const mockTeamId = 'team1'
    const mockCsrfToken = 'mock-csrf-token'

    mockGetCsrfToken.mockResolvedValue({ csrfToken: mockCsrfToken })
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response)

    await expect(fetchIssuesForTeam(mockTeamId)).rejects.toThrow('An error occurred while fetching the data.')
  })
})
