import { PrismaClient } from '@prisma/client'
import cookieSignature from 'cookie-signature'
import { IronSession } from 'iron-session'
import { cookies } from 'next/headers'

import getSession, { SessionData } from '@aces/lib/server/auth/session'


const prisma = new PrismaClient()

/**
 * Migrate the express-session cookie to the new session store
 *
 * This migrates the existing express-session cookie to the Next.js session store.
 * This allows us to access sensitive data in the session without having to decrypt
 * the cookie on every request. Note that this creates a new session in the store,
 * but does not save it.
 * @returns {Promise<IronSession<SessionData>>} The migrated session
 **/
async function migrateSession(): Promise<IronSession<SessionData> | null> {
  const cookieStore = cookies()
  const session = await getSession()

  const expressSessionId = cookieStore.get('connect.sid')
  if (expressSessionId) {
    // Decrypt express-session cookie (if signed)
    let sessionId = expressSessionId.value
    const secret = process.env.COOKIE_SECRET!

    if (sessionId.startsWith('s:')) {
      // The cookie is signed, so remove the "s:" prefix and unsign it
      sessionId = <string>cookieSignature.unsign(sessionId.slice(2), secret)
      if (!sessionId) {
        throw new Error('Invalid session signature')
      }
    }

    const expressSession = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!expressSession) {
      return null
    }

    const data = expressSession.data
    const { user, anonymous } = JSON.parse(data)
    session.user = user
    session.anonymous = anonymous
    return session
  }
  return null
}

export default migrateSession
