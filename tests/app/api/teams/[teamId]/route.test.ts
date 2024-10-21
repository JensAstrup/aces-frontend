import { Issue } from '@linear/sdk'
import { NextResponse } from 'next/server'

import { POST } from '@aces/app/api/issues/teams/[teamId]/route'
import getIssuesForTeam from '@aces/lib/linear/get-issues-for-team'


jest.mock('@aces/lib/linear/get-issues-for-team')
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))


const mockGetIssuesForTeam = getIssuesForTeam as jest.MockedFunction<typeof getIssuesForTeam>

describe('Team Issues Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return issues for a valid team ID', async () => {
    const mockIssues = [
      { id: 'issue1', title: 'Issue 1' },
      { id: 'issue2', title: 'Issue 2' },
    ] as Issue[]
    mockGetIssuesForTeam.mockResolvedValue({ issues: mockIssues })

    const mockRequest = {} as unknown as Request
    const mockParams = { params: { teamId: 'team123' } }

    await POST(mockRequest, mockParams)
    expect(NextResponse.json).toHaveBeenCalledWith({ issues: mockIssues }, { status: 200 })
    expect(mockGetIssuesForTeam).toHaveBeenCalledWith('team123')
  })

  it('should handle errors from getIssuesForTeam', async () => {
    mockGetIssuesForTeam.mockRejectedValue(new Error('Failed to fetch issues'))

    const mockRequest = {} as unknown as Request
    const mockParams = { params: { teamId: 'team123' } }

    await expect(POST(mockRequest, mockParams)).rejects.toThrow('Failed to fetch issues')
    expect(mockGetIssuesForTeam).toHaveBeenCalledWith('team123')
  })

  it('should handle empty issue list', async () => {
    mockGetIssuesForTeam.mockResolvedValue({ issues: [] })
    const mockRequest = {} as unknown as Request
    const mockParams = { params: { teamId: 'team123' } }

    await POST(mockRequest, mockParams)

    expect(NextResponse.json).toHaveBeenCalledWith({ issues: [] }, { status: 200 })
    expect(mockGetIssuesForTeam).toHaveBeenCalledWith('team123')
  })
})
