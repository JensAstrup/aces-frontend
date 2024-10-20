import { LinearClient } from '@linear/sdk'
import { User } from '@prisma/client'
import { IronSession } from 'iron-session'

import getIssuesForTeam from '@aces/lib/linear/get-issues-for-team'
import getSession, { SessionData } from '@aces/lib/server/auth/session'
import decrypt from '@aces/lib/utils/decrypt'


jest.mock('@linear/sdk')
jest.mock('@aces/lib/server/auth/session')
jest.mock('@aces/lib/utils/decrypt')

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockDecrypt = decrypt as jest.MockedFunction<typeof decrypt>

describe('getIssuesForTeam', () => {
  const mockLinearClient = {
    client: {
      rawRequest: jest.fn(),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(LinearClient as jest.MockedClass<typeof LinearClient>).mockImplementation(() => mockLinearClient as unknown as LinearClient)
  })

  it('should throw an error if user is not logged in', async () => {
    mockGetSession.mockResolvedValue({ user: null } as unknown as IronSession<SessionData>)

    await expect(getIssuesForTeam('team1')).rejects.toThrow('User must be logged in')
  })

  it('should throw an error if user token is missing', async () => {
    mockGetSession.mockResolvedValue({ user: { token: null, anonymous: true } as unknown as User } as unknown as IronSession<SessionData>)

    await expect(getIssuesForTeam('team1')).rejects.toThrow('User must be logged in')
  })

  it('should fetch issues for a team successfully', async () => {
    const mockToken = 'encrypted_token'
    const mockDecryptedToken = 'decrypted_token'
    const mockTeamId = 'team1'
    const mockIssues = [{ id: 'issue1', title: 'Test Issue' }]

    mockGetSession.mockResolvedValue({ user: { token: mockToken } as unknown as User } as unknown as IronSession<SessionData>)
    mockDecrypt.mockReturnValue(mockDecryptedToken)
    mockLinearClient.client.rawRequest.mockResolvedValue({
      data: {
        team: {
          issues: {
            nodes: mockIssues,
          },
        },
      },
    })

    const result = await getIssuesForTeam(mockTeamId)

    expect(mockDecrypt).toHaveBeenCalledWith(mockToken)
    expect(LinearClient).toHaveBeenCalledWith({ accessToken: mockDecryptedToken })
    expect(mockLinearClient.client.rawRequest).toHaveBeenCalledWith(
      expect.stringContaining('query issues'),
      expect.objectContaining({
        teamId: mockTeamId,
        filter: { estimate: { null: true } },
        nextPage: undefined,
      })
    )
    expect(result).toEqual({ issues: mockIssues })
  })

  it('should handle pagination correctly', async () => {
    const mockToken = 'encrypted_token'
    const mockDecryptedToken = 'decrypted_token'
    const mockTeamId = 'team1'
    const mockNextPage = 'next_page_cursor'
    const mockIssues = [{ id: 'issue2', title: 'Another Test Issue' }]

    mockGetSession.mockResolvedValue({ user: { token: mockToken } as unknown as User } as unknown as IronSession<SessionData>)
    mockDecrypt.mockReturnValue(mockDecryptedToken)
    mockLinearClient.client.rawRequest.mockResolvedValue({
      data: {
        team: {
          issues: {
            nodes: mockIssues,
          },
        },
      },
    })

    const result = await getIssuesForTeam(mockTeamId, mockNextPage)

    expect(mockLinearClient.client.rawRequest).toHaveBeenCalledWith(
      expect.stringContaining('query issues'),
      expect.objectContaining({
        teamId: mockTeamId,
        filter: { estimate: { null: true } },
        nextPage: mockNextPage,
      })
    )
    expect(result).toEqual({ issues: mockIssues })
  })

  it('should handle empty result set', async () => {
    const mockToken = 'encrypted_token'
    const mockDecryptedToken = 'decrypted_token'
    const mockTeamId = 'team1'

    mockGetSession.mockResolvedValue({ user: { token: mockToken } as unknown as User } as unknown as IronSession<SessionData>)
    mockDecrypt.mockReturnValue(mockDecryptedToken)
    mockLinearClient.client.rawRequest.mockResolvedValue({
      data: {
        team: {
          issues: {
            nodes: [],
          },
        },
      },
    })

    const result = await getIssuesForTeam(mockTeamId)

    expect(result).toEqual({ issues: [] })
  })
})
