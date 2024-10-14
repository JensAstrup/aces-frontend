import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import migrateSession from '@aces/lib/utils/migrate-session'


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
  try {
    const migratedSession = await migrateSession()
    if (migratedSession) {
      await migratedSession.save()
      return NextResponse.json({ message: 'Session migrated' }, { status: 200 })
    }
    return NextResponse.json({ message: 'No session to migrate' }, { status: 404 })
  }
  catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ message: 'Failed to migrate session' }, { status: 500 })
  }
}

export { POST }
