import * as Sentry from '@sentry/nextjs'
import { IronSession } from 'iron-session'

import { POST } from '@aces/app/api/auth/migrate/route'
import { SessionData } from '@aces/lib/server/auth/session'
import migrateSession from '@aces/lib/utils/migrate-session'


jest.mock('@sentry/nextjs')
jest.mock('@aces/lib/utils/migrate-session')
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => new Response(JSON.stringify(body), init)),
  },
}))
const mockMigrateSession = jest.mocked(migrateSession)

describe('POST migrate route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return success if session is migrated', async () => {
    const mockSession = {
      save: jest.fn(),
    }
    mockMigrateSession.mockResolvedValue(mockSession as unknown as IronSession< SessionData>)

    const response = await POST()

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ message: 'Session migrated' })
    expect(mockSession.save).toHaveBeenCalled()
  })

  it('should return 404 if no session to migrate', async () => {
    mockMigrateSession.mockResolvedValue(null)

    const response = await POST()

    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json).toEqual({ message: 'No session to migrate' })
  })

  it('should return 500 and capture exception if an error occurs', async () => {
    const mockError = new Error('Migration failed')
    mockMigrateSession.mockRejectedValue(mockError)

    const mockCaptureException = Sentry.captureException as jest.MockedFunction<typeof Sentry.captureException>

    const response = await POST()

    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json).toEqual({ message: 'Failed to migrate session' })
    expect(mockCaptureException).toHaveBeenCalledWith(mockError)
  })
})
