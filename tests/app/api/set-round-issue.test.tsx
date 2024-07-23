import setRoundIssue from '@aces/app/api/set-round-issue'

// Mock fetch globally
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    }
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('setRoundIssue', () => {
  const originalEnv = process.env
  const mockAccessToken = 'mock-access-token'
  const mockRoundId = 'mock-round-id'
  const mockIssueId = 123

  beforeEach(() => {
    process.env = { ...originalEnv, NEXT_PUBLIC_API_URL: 'http://mock-api.com' }
    localStorage.clear()
    localStorage.setItem('accessToken', mockAccessToken)
    jest.resetAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
    localStorage.clear()
  })

  it('should successfully set the round issue', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 204
    })

    await expect(setRoundIssue(mockRoundId, mockIssueId)).resolves.not.toThrow()

    expect(global.fetch).toHaveBeenCalledWith(
      `http://mock-api.com/rounds/${mockRoundId}/issue`,
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

  it('should throw an error if no access token is found', async () => {
    localStorage.clear()

    await expect(setRoundIssue(mockRoundId, mockIssueId)).rejects.toThrow('No access token found')
  })

  it('should throw an error if the response status is not 204', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 400
    })

    await expect(setRoundIssue(mockRoundId, mockIssueId)).rejects.toThrow('Failed to set issue')
  })

  it('should throw an error if the fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    await expect(setRoundIssue(mockRoundId, mockIssueId)).rejects.toThrow('Network error')
  })
})
