import { LinearClient, User as LinearUser } from '@linear/sdk'
import { User } from '@prisma/client'

import getTeams from '@aces/lib/linear/get-teams'
import decrypt from '@aces/lib/utils/decrypt'


jest.mock('@linear/sdk')
jest.mock('@aces/lib/utils/decrypt')

describe('getTeams', () => {
  const mockDecrypt = decrypt as jest.MockedFunction<typeof decrypt>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return an empty array if user has no token', async () => {
    const user: User = { id: '1', token: null } as User

    const result = await getTeams(user)

    expect(result).toEqual([])
    expect(mockDecrypt).not.toHaveBeenCalled()
    expect(LinearClient).not.toHaveBeenCalled()
  })

  it('should return teams for a user with a valid token', async () => {
    const user: User = { id: '1', token: 'encrypted_token' } as User
    const decryptedToken = 'decrypted_token'
    const mockTeams = [
      { id: 'team1', name: 'Team 1' },
      { id: 'team2', name: 'Team 2' },
    ]

    mockDecrypt.mockReturnValue(decryptedToken)

    const mockTeamsFunction = jest.fn().mockResolvedValue({ nodes: mockTeams })
    const mockViewer = { teams: mockTeamsFunction }

    jest.spyOn(LinearClient.prototype, 'viewer', 'get').mockReturnValue(mockViewer as unknown as Promise<LinearUser>)

    const result = await getTeams(user)

    expect(result).toEqual(mockTeams)
    expect(mockDecrypt).toHaveBeenCalledWith('encrypted_token')
    expect(LinearClient).toHaveBeenCalledWith({ accessToken: decryptedToken })
    expect(mockTeamsFunction).toHaveBeenCalled()
  })

  it('should handle empty team list', async () => {
    const user: User = { id: '1', token: 'encrypted_token' } as User
    const decryptedToken = 'decrypted_token'

    mockDecrypt.mockReturnValue(decryptedToken)

    const mockTeamsFunction = jest.fn().mockResolvedValue({ nodes: [] })
    const mockViewer = { teams: mockTeamsFunction }

    jest.spyOn(LinearClient.prototype, 'viewer', 'get').mockReturnValue(mockViewer as unknown as Promise<LinearUser>)

    const result = await getTeams(user)

    expect(result).toEqual([])
    expect(mockDecrypt).toHaveBeenCalledWith('encrypted_token')
    expect(LinearClient).toHaveBeenCalledWith({ accessToken: decryptedToken })
    expect(mockTeamsFunction).toHaveBeenCalled()
  })

  it('should handle LinearClient throwing an error', async () => {
    const user: User = { id: '1', token: 'encrypted_token' } as User
    const decryptedToken = 'decrypted_token'

    mockDecrypt.mockReturnValue(decryptedToken)

    const mockTeamsFunction = jest.fn().mockRejectedValue(new Error('Linear API error'))
    const mockViewer = { teams: mockTeamsFunction }

    jest.spyOn(LinearClient.prototype, 'viewer', 'get').mockReturnValue(mockViewer as unknown as Promise<LinearUser>)

    await expect(getTeams(user)).rejects.toThrow('Linear API error')
    expect(mockDecrypt).toHaveBeenCalledWith('encrypted_token')
    expect(LinearClient).toHaveBeenCalledWith({ accessToken: decryptedToken })
  })

  it('should handle decrypt function throwing an error', async () => {
    const user: User = { id: '1', token: 'encrypted_token' } as User

    mockDecrypt.mockImplementation(() => {
      throw new Error('Decryption error')
    })

    await expect(getTeams(user)).rejects.toThrow('Decryption error')
    expect(mockDecrypt).toHaveBeenCalledWith('encrypted_token')
    expect(LinearClient).not.toHaveBeenCalled()
  })
})
