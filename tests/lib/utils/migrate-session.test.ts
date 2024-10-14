import { PrismaClient, Session } from '@prisma/client'
import cookieSignature from 'cookie-signature'
import { IronSession } from 'iron-session'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { cookies } from 'next/headers'

import getSession, { SessionData } from '@aces/lib/server/auth/session'
import migrateSession from '@aces/lib/utils/migrate-session'


const mockGetSession = getSession as jest.MockedFunction<typeof getSession>

jest.mock('@aces/lib/server/auth/session')
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))
jest.mock('cookie-signature', () => ({
  unsign: jest.fn(),
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

describe('migrateSession', () => {
  let mockPrismaClient: jest.Mocked<PrismaClient>

  beforeAll(() => {
    process.env.COOKIE_SECRET = 'testsecret'
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockPrismaClient = new PrismaClient() as jest.Mocked<PrismaClient>
  })

  it('should return null if no connect.sid cookie is present', async () => {
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ReadonlyRequestCookies)

    mockGetSession.mockResolvedValue({
      user: null,
      anonymous: true,
    } as IronSession<SessionData>)

    const result = await migrateSession()

    expect(result).toBeNull()
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

    const mockSession = {
      user: null,
      anonymous: true,
    } as IronSession<SessionData>
    mockGetSession.mockResolvedValue(mockSession)

    const result = await migrateSession()

    expect(cookieSignature.unsign).toHaveBeenCalledWith('validsessionid', 'testsecret')
    expect(mockPrismaClient.session.findUnique).toHaveBeenCalledWith({
      where: { id: 'validsessionid' },
    })
    expect(mockGetSession).toHaveBeenCalled()
    expect(result).toEqual({
      user: { id: 'user1' },
      anonymous: false,
    })
  })

  it('should return null if session is not found with signed cookie', async () => {
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
    } as IronSession<SessionData>)

    const result = await migrateSession()

    expect(cookieSignature.unsign).toHaveBeenCalledWith('invalidsessionid', 'testsecret')
    expect(mockPrismaClient.session.findUnique).toHaveBeenCalledWith({
      where: { id: 'invalidsessionid' },
    })
    expect(result).toBeNull()
  })

  it('should throw an error if signed cookie has invalid signature', async () => {
    const signedSessionId = 's:invalidsignature'
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: signedSessionId }),
    } as unknown as ReadonlyRequestCookies)

    const mockCookieSign = cookieSignature.unsign as jest.Mock
    mockCookieSign.mockReturnValue(false)

    mockGetSession.mockResolvedValue({
      user: null,
      anonymous: true,
    } as IronSession<SessionData>)

    await expect(migrateSession()).rejects.toThrow('Invalid session signature')
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

    const mockSession = {
      user: null,
      anonymous: true,
    } as IronSession<SessionData>
    mockGetSession.mockResolvedValue(mockSession)

    const result = await migrateSession()

    expect(cookieSignature.unsign).not.toHaveBeenCalled()
    expect(mockPrismaClient.session.findUnique).toHaveBeenCalledWith({
      where: { id: sessionId },
    })
    expect(mockGetSession).toHaveBeenCalled()
    expect(result).toEqual({
      user: { id: 'user2' },
      anonymous: false,
    })
  })

  it('should return null if session is not found with unsigned cookie', async () => {
    const sessionId = 'nonexistentsessionid'
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: sessionId }),
    } as unknown as ReadonlyRequestCookies)

    jest.spyOn(mockPrismaClient.session, 'findUnique').mockResolvedValue(null)

    mockGetSession.mockResolvedValue({
      user: null,
      anonymous: true,
    } as IronSession<SessionData>)

    const result = await migrateSession()

    expect(mockPrismaClient.session.findUnique).toHaveBeenCalledWith({
      where: { id: sessionId },
    })
    expect(result).toBeNull()
  })

  it('should throw an error if prisma.findUnique throws', async () => {
    const sessionId = 'errorSessionId'
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: sessionId }),
    } as unknown as ReadonlyRequestCookies)

    jest.spyOn(mockPrismaClient.session, 'findUnique').mockRejectedValue(new Error('Database error'))

    mockGetSession.mockResolvedValue({
      user: null,
      anonymous: true,
    } as IronSession<SessionData>)

    await expect(migrateSession()).rejects.toThrow('Database error')
  })
})
