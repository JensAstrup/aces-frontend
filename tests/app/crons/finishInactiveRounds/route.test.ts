import { NextRequest, NextResponse } from 'next/server'

import getInactiveRounds from '@aces/app/crons/finishInactiveRounds/getInactiveRounds'
import { GET } from '@aces/app/crons/finishInactiveRounds/route'
import logger from '@aces/lib/logger'


jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))

jest.mock('@aces/lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
  },
}))

jest.mock('@aces/app/crons/finishInactiveRounds/getInactiveRounds', () => jest.fn().mockResolvedValue(5))
const mockNextResponse = jest.mocked(NextResponse)
const mockGetInactiveRounds = jest.mocked(getInactiveRounds)
const mockLogger = jest.mocked(logger)


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
    expect(mockLogger.info).toHaveBeenCalledWith('Updated 5 rounds')
    expect(mockGetInactiveRounds).toHaveBeenCalledTimes(1)
    expect(mockNextResponse.json).toHaveBeenCalledWith({ success: true, updatedRounds: 5 })
  })
})
