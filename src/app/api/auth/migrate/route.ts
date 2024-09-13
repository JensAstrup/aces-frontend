import { PrismaClient } from '@prisma/client'
import cookieSignature from 'cookie-signature'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import getSession from '@aces/lib/server/auth/session'


const prisma = new PrismaClient()

async function POST() {
  const cookieStore = cookies()
  const session = await getSession()

  // Check for express-session cookie
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

      console.log('Decrypted sessionId:', sessionId)

      // Find session in Prisma using the decrypted sessionId
      const expressSession = await prisma.session.findUnique({
        where: { id: sessionId },
      })

      if (!expressSession) {
        return NextResponse.json({ message: 'Session not found' }, { status: 404 })
      }

      const data = expressSession.data
      console.log('Express session data:', data)
      const { user, anonymous } = JSON.parse(data)
      console.log('User:', user)
      console.log('Anonymous:', anonymous)
      session.user = user
      session.anonymous = anonymous
      await session.save()

      console.log('Session migrated successfully')
      console.log('Session:', session)
      console.log('User:', session.user)
    }
    catch (error) {
      console.error('Failed to migrate session:', error)
      return NextResponse.json({ message: 'Failed to migrate session' }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Session migrated successfully' })
}

export { POST }
