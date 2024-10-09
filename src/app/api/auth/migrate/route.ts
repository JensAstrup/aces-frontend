import { PrismaClient } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import cookieSignature from 'cookie-signature'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import getSession from '@aces/lib/server/auth/session'


const prisma = new PrismaClient()

/**
 * Migrate the express-session cookie to the new session store
 *
 * This is a one-time operation to migrate the existing express-session
 * cookie to the Next.js session store. This allows us to access sensitive
 * data in the session without having to decrypt the cookie on every request.
 *
 * @returns {Promise<NextResponse>} The response
 **/
async function POST() {
  const cookieStore = cookies()
  const session = await getSession()

  const expressSessionId = cookieStore.get('connect.sid')
  if (expressSessionId) {
    try {
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
        return NextResponse.json({ message: 'Session not found' }, { status: 404 })
      }

      const data = expressSession.data
      const { user, anonymous } = JSON.parse(data)
      session.user = user
      session.anonymous = anonymous
      await session.save()
    }
    catch (error) {
      Sentry.captureException(error)
      return NextResponse.json({ message: 'Failed to migrate session' }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Session migrated successfully' })
}

export { POST }
