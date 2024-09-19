jest.mock('server-only')
import { PrismaClient, Session } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import cookieSignature from 'cookie-signature'
import { IronSession } from 'iron-session'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { cookies } from 'next/headers'

import { POST } from '@aces/app/api/auth/migrate/route'
import getSession, { SessionData } from '@aces/lib/server/auth/session'


const mockGetSession = getSession as jest.MockedFunction<typeof getSession>

jest.mock('@aces/lib/server/auth/session')
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))
jest.mock('cookie-signature', () => ({
  unsign: jest.fn(),
}))
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}))
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => new Response(JSON.stringify(body), init)),
  },
}))
jest.mock('iron-session')
const mockCookies = cookies as jest.MockedFunction<typeof cookies>

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    session: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  }
  return { PrismaClient: jest.fn(() => mockPrismaClient) }
})

describe('POST migrate route', () => {
  let mockPrismaClient: jest.Mocked<PrismaClient>

  beforeAll(() => {
    process.env.COOKIE_SECRET = 'testsecret'
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockPrismaClient = new PrismaClient() as jest.Mocked<PrismaClient>
  })

  it('should return success if no connect.sid cookie is present', async () => {
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ReadonlyRequestCookies)

    const mockSave = jest.fn()
    mockGetSession.mockResolvedValue({
      user: null,
      anonymous: true,
      save: mockSave,
    } as unknown as IronSession<SessionData>)

    const response = await POST()

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ message: 'Session migrated successfully' })
    expect(mockGetSession).toHaveBeenCalled()
    expect(mockPrismaClient.session.findUnique).not.toHaveBeenCalled()
  })

  it('should migrate session successfully with signed cookie', async () => {
    const signedSessionId = 's:validsessionid'
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: signedSessionId }),
    } as unknown as ReadonlyRequestCookies)

    const mockCookieSign = cookieSignature.unsign as jest.Mock
    mockCookieSign.mockReturnValue('validsessionid')

    jest.spyOn(mockPrismaClient.session, 'findUnique').mockResolvedValue({
      id: 'validsessionid',
      data: JSON.stringify({ user: { id: 'user1' }, anonymous: false }),
    } as unknown as Session)

    const mockSave = jest.fn()
    mockGetSession.mockResolvedValue({
      user: null,
      anonymous: true,
      save: mockSave,
    } as unknown as IronSession<SessionData>)

    const response = await POST()

    expect(cookieSignature.unsign).toHaveBeenCalledWith('validsessionid', 'testsecret')
    expect(mockPrismaClient.session.findUnique).toHaveBeenCalledWith({
      where: { id: 'validsessionid' },
    })
    expect(mockGetSession).toHaveBeenCalled()
    expect(mockSave).toHaveBeenCalled()

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ message: 'Session migrated successfully' })
  })

  it('should return 404 if session is not found with signed cookie', async () => {
    const signedSessionId = 's:invalidsessionid'
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: signedSessionId }),
    } as unknown as ReadonlyRequestCookies)

    const mockCookieSign = cookieSignature.unsign as jest.Mock
    mockCookieSign.mockReturnValue('invalidsessionid')

    jest.spyOn(mockPrismaClient.session, 'findUnique').mockResolvedValue(null)

    mockGetSession.mockResolvedValue({
      user: null,
      anonymous: true,
      save: jest.fn(),
    } as unknown as IronSession<SessionData>)

    const response = await POST()

    expect(cookieSignature.unsign).toHaveBeenCalledWith('invalidsessionid', 'testsecret')
    expect(mockPrismaClient.session.findUnique).toHaveBeenCalledWith({
      where: { id: 'invalidsessionid' },
    })

    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json).toEqual({ message: 'Session not found' })
  })

  it('should return 500 if signed cookie has invalid signature', async () => {
    const signedSessionId = 's:invalidsignature'
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: signedSessionId }),
    } as unknown as ReadonlyRequestCookies)

    const mockCookieSign = cookieSignature.unsign as jest.Mock
    mockCookieSign.mockReturnValue(false)

    mockGetSession.mockResolvedValue({
      user: null,
      anonymous: true,
      save: jest.fn(),
    } as unknown as IronSession<SessionData>)

    const response = await POST()

    expect(cookieSignature.unsign).toHaveBeenCalledWith('invalidsignature', 'testsecret')
    expect(Sentry.captureException).toHaveBeenCalledWith(new Error('Invalid session signature'))

    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json).toEqual({ message: 'Failed to migrate session' })
  })

  it('should migrate session successfully with unsigned cookie', async () => {
    const sessionId = 'unsignedsessionid'
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: sessionId }),
    } as unknown as ReadonlyRequestCookies)

    jest.spyOn(mockPrismaClient.session, 'findUnique').mockResolvedValue({
      id: sessionId,
      data: JSON.stringify({ user: { id: 'user2' }, anonymous: false }),
    } as unknown as Session)

    const mockSave = jest.fn()
    mockGetSession.mockResolvedValue({
      user: null,
      anonymous: true,
      save: mockSave,
    } as unknown as IronSession<SessionData>)

    const response = await POST()

    expect(cookieSignature.unsign).not.toHaveBeenCalled()
    expect(mockPrismaClient.session.findUnique).toHaveBeenCalledWith({
      where: { id: sessionId },
    })
    expect(mockGetSession).toHaveBeenCalled()
    expect(mockSave).toHaveBeenCalled()

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ message: 'Session migrated successfully' })
  })

  it('should return 404 if session is not found with unsigned cookie', async () => {
    const sessionId = 'nonexistentsessionid'
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: sessionId }),
    } as unknown as ReadonlyRequestCookies)

    jest.spyOn(mockPrismaClient.session, 'findUnique').mockResolvedValue(null)

    mockGetSession.mockResolvedValue({
      user: null,
      anonymous: true,
      save: jest.fn(),
    } as unknown as IronSession<SessionData>)

    const response = await POST()

    expect(mockPrismaClient.session.findUnique).toHaveBeenCalledWith({
      where: { id: sessionId },
    })

    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json).toEqual({ message: 'Session not found' })
  })

  it('should return 500 and capture exception if prisma.findUnique throws', async () => {
    const sessionId = 'errorSessionId'
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: sessionId }),
    } as unknown as ReadonlyRequestCookies)

    jest.spyOn(mockPrismaClient.session, 'findUnique').mockRejectedValue(new Error('Database error'))

    mockGetSession.mockResolvedValue({
      user: null,
      anonymous: true,
      save: jest.fn(),
    } as unknown as IronSession<SessionData>)

    const response = await POST()

    expect(mockPrismaClient.session.findUnique).toHaveBeenCalledWith({
      where: { id: sessionId },
    })
    expect(Sentry.captureException).toHaveBeenCalledWith(new Error('Database error'))

    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json).toEqual({ message: 'Failed to migrate session' })
  })
})
