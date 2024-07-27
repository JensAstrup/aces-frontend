import fetchMock from 'jest-fetch-mock'

import setRoundIssue from '@aces/lib/api/set-round-issue'


fetchMock.enableMocks()

describe('setRoundIssue', () => {
  const mockRoundId = 'test-round-id'
  const mockIssueId = 'test-issue-id'
  const mockAccessToken = 'test-access-token'
  const mockApiUrl = 'https://api.example.com'

  beforeEach(() => {
    fetchMock.resetMocks()
    localStorage.clear()
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl
  })

  it('should make a POST request with correct parameters', async () => {
    localStorage.setItem('accessToken', mockAccessToken)
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 })

    await setRoundIssue(mockRoundId, mockIssueId)

    expect(fetchMock).toHaveBeenCalledWith(
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

  it('should throw an error if no access token is found', async () => {
    await expect(setRoundIssue(mockRoundId, mockIssueId)).rejects.toThrow('No access token found')
  })

  it('should throw an error if the response is not ok', async () => {
    localStorage.setItem('accessToken', mockAccessToken)
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 400 })

    await expect(setRoundIssue(mockRoundId, mockIssueId)).rejects.toThrow('Failed to set issue')
  })

  it('should not throw an error if the response is ok', async () => {
    localStorage.setItem('accessToken', mockAccessToken)
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 })

    await expect(setRoundIssue(mockRoundId, mockIssueId)).resolves.not.toThrow()
  })

  it('should use the correct API URL from environment variable', async () => {
    const customApiUrl = 'https://custom-api.example.com'
    process.env.NEXT_PUBLIC_API_URL = customApiUrl
    localStorage.setItem('accessToken', mockAccessToken)
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 })

    await setRoundIssue(mockRoundId, mockIssueId)

    expect(fetchMock).toHaveBeenCalledWith(
      `${customApiUrl}/rounds/${mockRoundId}/issue`,
      expect.any(Object)
    )
  })
})
