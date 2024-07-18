import fetch from 'jest-fetch-mock'

import { View } from '@aces/app/voting/get-favorite-views'
import getIssues, { Issue } from '@aces/app/voting/use-get-issues'


jest.mock('node-fetch', () => require('jest-fetch-mock'))

describe('getIssues', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
  }
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })

  // Mock environment variable
  process.env.NEXT_PUBLIC_API_URL = 'http://api.example.com'

  beforeEach(() => {
    fetch.resetMocks()
    jest.clearAllMocks()
  })

  it('should fetch issues successfully', async () => {
    const mockView = { id: 1 } as View
    const mockAccessToken = 'mock-token'
    const mockIssues: Issue[] = [
      {
        id: 1,
        title: 'Test Issue',
        description: 'This is a test issue',
        state: { name: 'Open', type: 'default' },
        comments: {
          nodes: [
            {
              id: 1,
              body: 'Test comment',
              user: { id: 1, name: 'Test User', avatarUrl: 'http://example.com/avatar.jpg' }
            }
          ]
        },
        url: 'http://example.com/issue/1'
      }
    ]

    localStorageMock.getItem.mockReturnValue(mockAccessToken)
    fetch.mockResponseOnce(JSON.stringify(mockIssues))

    const result = await getIssues(mockView)

    expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken')
    expect(fetch).toHaveBeenCalledWith(
      'http://api.example.com/views/1/issues',
      {
        headers: {
          Authorization: mockAccessToken,
        },
      }
    )
    expect(result).toEqual(mockIssues)
  })

  it('should throw an error if no access token is found', async () => {
    const mockView = { id: 1 } as View
    localStorageMock.getItem.mockReturnValue(null)

    await expect(getIssues(mockView)).rejects.toThrow('No access token found')
  })

  it('should handle API errors', async () => {
    const mockView = { id: 1 } as View
    const mockAccessToken = 'mock-token'
    const errorMessage = 'API Error'

    localStorageMock.getItem.mockReturnValue(mockAccessToken)
    fetch.mockRejectOnce(new Error(errorMessage))

    await expect(getIssues(mockView)).rejects.toThrow(errorMessage)
  })
})
