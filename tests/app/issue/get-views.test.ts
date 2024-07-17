import { Request, Response } from 'express'

import getFavoriteViews, { View } from '@aces/app/issue/get-views'

// Mock fetch
global.fetch = jest.fn()

describe('getFavoriteViews', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseObject = {}

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result
        return mockResponse
      })
    }
    jest.resetAllMocks()
  })

  const mockViews: View[] = [
    { id: 1, name: 'View 1' },
    { id: 2, name: 'View 2' },
  ]

  it('should return favorite views when authenticated', async () => {
    mockRequest.headers = { authorization: 'valid-token' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockViews)
    })

    await getFavoriteViews('test-token')

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/views`,
      expect.objectContaining({
        headers: { Authorization: 'test-token' }
      })
    )
    expect(mockResponse.status).toHaveBeenCalledWith(200)
    expect(mockResponse.json).toHaveBeenCalled()
    expect(responseObject).toEqual(mockViews)
  })

  it('should return 401 when fetch returns unauthorized', async () => {
    mockRequest.headers = { authorization: 'invalid-token' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 401,
      json: jest.fn().mockResolvedValueOnce({ error: 'Unauthorized' })
    })

    await getFavoriteViews('test-token')

    expect(mockResponse.status).toHaveBeenCalledWith(401)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
  })

  it('should return 500 when fetch fails', async () => {
    mockRequest.headers = { authorization: 'valid-token' };
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    await getFavoriteViews('valid-token')

    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' })
  })
})
