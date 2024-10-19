import { NextRequest, NextResponse } from 'next/server'

import { GET } from '@aces/app/crons/finishInactiveRounds/route'


jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))

jest.mock('@aces/app/crons/finishInactiveRounds/getInactiveRounds', () => jest.fn())
const mockNextResponse = jest.mocked(NextResponse)


describe('finishInactiveRounds route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'correct-secret'
  })

  it('should return 401 if the authorization header is not correct', async () => {
    const request = {
      headers: {
        get: jest.fn().mockReturnValue('Bearer wrong-secret')
      }
    } as unknown as NextRequest
    await GET(request)
    expect(mockNextResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid or missing authorization header' }, { status: 401 })
  })

  it('should return 200 if the authorization header is correct', async () => {
    const request = {
      headers: {
        get: jest.fn().mockReturnValue('Bearer correct-secret')
      }
    } as unknown as NextRequest
    await GET(request)
    expect(mockNextResponse.json).toHaveBeenCalledWith({ success: true })
  })
})
