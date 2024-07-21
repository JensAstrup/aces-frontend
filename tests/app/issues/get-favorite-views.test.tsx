import getFavoriteViews, { View } from '@aces/app/issues/get-favorite-views'


describe('getFavoriteViews', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should fetch favorite views and return data', async () => {
    const mockData: View[] = [
      { id: 1, name: 'View 1' },
      { id: 2, name: 'View 2' }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockData)
    })

    const token = 'Bearer mockToken'
    const views = await getFavoriteViews(token)

    expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/views`, {
      headers: { Authorization: token }
    })
    expect(views).toEqual(mockData)
  })

  it('should handle fetch errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const token = 'Bearer mockToken'

    await expect(getFavoriteViews(token)).rejects.toThrow('Network error')
  })
})
