import 'server-only'
import { User } from '@prisma/client'
import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'


const ironOptions = {
  cookieName: 'aces_session',
  password: process.env.COOKIE_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  },
}

type SessionData = {
  user: Omit<User, 'token'> | null
  anonymous: boolean
}

async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = cookies()
  const session = await getIronSession<SessionData>(cookieStore, ironOptions)
  return session
}

export default getSession
export type { SessionData }
