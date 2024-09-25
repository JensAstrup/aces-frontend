import { jest } from '@jest/globals'
import { LinearClient } from '@linear/sdk'

import setEstimate from '@aces/lib/estimates/api/estimate'
import getSession from '@aces/lib/server/auth/session'
import decrypt from '@aces/lib/utils/decrypt'


jest.mock('@aces/lib/utils/decrypt', () => ({
  __esModule: true,
  default: jest.fn(),
}))
const mockDecrypt = decrypt as jest.MockedFunction<typeof decrypt>

jest.mock('server-only', () => jest.fn())
jest.mock('iron-session', () => ({
  getIronSession: jest.fn(),
}))
jest.mock('@aces/lib/server/auth/session')
jest.mock('@linear/sdk')

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockUpdateIssue = jest.fn()

describe('setEstimate', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ; // @ts-expect-error Just handling for mock implementation
    (LinearClient as jest.MockedClass<typeof LinearClient>).mockImplementation(() => ({
      updateIssue: mockUpdateIssue,
    } as unknown as LinearClient))
  })

  it('should return an error message when no token is found', async () => {
    mockGetSession.mockResolvedValue({
      user: { token: null },
    } as Awaited<ReturnType<typeof getSession>>)

    const result = await setEstimate('issue-123', 5)

    expect(result).toEqual({ message: 'No token found' })
    expect(mockDecrypt).not.toHaveBeenCalled()
    expect(LinearClient).not.toHaveBeenCalled()
    expect(mockUpdateIssue).not.toHaveBeenCalled()
  })

  it('should update the issue estimate when a token is found', async () => {
    const mockToken = 'encrypted-token'
    const mockDecryptedToken = 'decrypted-token'
    mockGetSession.mockResolvedValue({
      user: { token: mockToken },
    } as Awaited<ReturnType<typeof getSession>>)
    mockDecrypt.mockReturnValue(mockDecryptedToken)

    const result = await setEstimate('issue-123', 5)

    expect(result).toEqual({ message: 'Estimate saved successfully' })
    expect(mockDecrypt).toHaveBeenCalledWith(mockToken)
    expect(LinearClient).toHaveBeenCalledWith({ accessToken: mockDecryptedToken })
    expect(mockUpdateIssue).toHaveBeenCalledWith('issue-123', { estimate: 5 })
  })

  it('should throw an error if LinearClient.updateIssue fails', async () => {
    const mockToken = 'encrypted-token'
    mockGetSession.mockResolvedValue({
      user: { token: mockToken },
    } as Awaited<ReturnType<typeof getSession>>)
    mockDecrypt.mockReturnValue('decrypted-token')
    // @ts-expect-error Forcing a rejection to test error handling
    mockUpdateIssue.mockRejectedValue(new Error('Linear API error'))

    await expect(setEstimate('issue-123', 5)).rejects.toThrow('Linear API error')
  })
})
