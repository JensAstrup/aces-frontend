import { LinearClient } from '@linear/sdk'
import { User } from '@prisma/client'

import getFavoriteViews from '@aces/lib/linear/get-views'
import decrypt from '@aces/lib/utils/decrypt'


jest.mock('@linear/sdk')
jest.mock('@aces/lib/utils/decrypt')

describe('getFavoriteViews', () => {
  const mockDecrypt = decrypt as jest.MockedFunction<typeof decrypt>
  const mockLinearClient = {
    favorites: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(LinearClient as jest.MockedClass<typeof LinearClient>).mockImplementation(() => mockLinearClient as unknown as LinearClient)
    mockDecrypt.mockReturnValue('decrypted-token')
  })

  it('should return an empty array if user has no token', async () => {
    const user = { token: null } as User
    const result = await getFavoriteViews(user)
    expect(result).toEqual([])
    expect(LinearClient).not.toHaveBeenCalled()
  })

  it('should return filtered and mapped custom views', async () => {
    const user = { token: 'encrypted-token' } as User
    const mockFavorites = {
      nodes: [
        { type: 'customView', customView: Promise.resolve({ id: 'view1', name: 'View 1' }) },
        { type: 'issue' },
        { type: 'customView', customView: Promise.resolve({ id: 'view2', name: 'View 2' }) },
        { type: 'customView', customView: Promise.resolve(null) },
      ],
    }
    mockLinearClient.favorites.mockResolvedValue(mockFavorites)

    const result = await getFavoriteViews(user)

    expect(mockDecrypt).toHaveBeenCalledWith('encrypted-token')
    expect(LinearClient).toHaveBeenCalledWith({ accessToken: 'decrypted-token' })
    expect(mockLinearClient.favorites).toHaveBeenCalled()
    expect(result).toEqual([
      { id: 'view1', name: 'View 1' },
      { id: 'view2', name: 'View 2' },
    ])
  })

  it('should handle errors gracefully', async () => {
    const user = { token: 'encrypted-token' } as User
    mockLinearClient.favorites.mockRejectedValue(new Error('API error'))

    await expect(getFavoriteViews(user)).rejects.toThrow('API error')
  })

  it('should filter out null views', async () => {
    const user = { token: 'encrypted-token' } as User
    const mockFavorites = {
      nodes: [
        { type: 'customView', customView: Promise.resolve({ id: 'view1', name: 'View 1' }) },
        { type: 'customView', customView: Promise.resolve(null) },
      ],
    }
    mockLinearClient.favorites.mockResolvedValue(mockFavorites)

    const result = await getFavoriteViews(user)

    expect(result).toEqual([
      { id: 'view1', name: 'View 1' },
    ])
  })
})
