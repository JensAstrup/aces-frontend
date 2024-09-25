import 'server-only'
import { User } from '@prisma/client'
import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'



type SessionData = {
  user: User | null
  anonymous: boolean
}

async function getSession(): Promise<IronSession<SessionData>> {
  const ironOptions = {
    cookieName: 'aces_session',
    password: process.env.COOKIE_SECRET!,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict'
    },
  }

  const cookieStore = cookies()
  const session = await getIronSession<SessionData>(cookieStore, ironOptions)
  return session
}

export default getSession
export type { SessionData }
