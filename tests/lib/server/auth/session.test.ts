jest.mock('server-only', () => jest.fn())
import { User } from '@prisma/client'
import { IronSession } from 'iron-session'
import { cookies } from 'next/headers'

import getSession, { SessionData } from '@aces/lib/server/auth/session'


jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

jest.mock('iron-session', () => ({
  getIronSession: jest.fn(),
}))

describe('getSession', () => {
  const mockCookies = cookies as jest.MockedFunction<typeof cookies>
  const mockGetIronSession = jest.requireMock('iron-session').getIronSession as jest.MockedFunction<typeof import('iron-session').getIronSession>

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should call cookies() to get the cookie store', async () => {
    await getSession()
    expect(mockCookies).toHaveBeenCalled()
  })

  it('should call getIronSession with correct parameters', async () => {
    const mockCookieStore = {} as ReturnType<typeof cookies>
    mockCookies.mockReturnValue(mockCookieStore)

    await getSession()

    expect(mockGetIronSession).toHaveBeenCalledWith(
      mockCookieStore,
      {
        cookieName: 'aces_session',
        password: process.env.COOKIE_SECRET,
        cookieOptions: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: 'strict'
        },
      }
    )
  })

  it('should return the session from getIronSession', async () => {
    const mockSession: IronSession<SessionData> = {
      user: null,
      anonymous: true,
      destroy: jest.fn(),
      save: jest.fn(),
    } as unknown as IronSession<SessionData>
    mockGetIronSession.mockResolvedValue(mockSession)

    const result = await getSession()

    expect(result).toBe(mockSession)
  })

  it('should handle a session with a user', async () => {
    const mockUser: Omit<User, 'token'> = {
      id: '1',
      displayName: 'Test User',
      email: 'test@example.com',
      linearId: '123',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const mockSession: IronSession<SessionData> = {
      user: mockUser,
      anonymous: false,
      destroy: jest.fn(),
      save: jest.fn(),
    } as unknown as IronSession<SessionData>
    mockGetIronSession.mockResolvedValue(mockSession)

    const result = await getSession()

    expect(result.user).toEqual(mockUser)
    expect(result.anonymous).toBe(false)
  })
})
