import { NextRequest, NextResponse } from 'next/server'

import getInactiveRounds from '@aces/app/crons/finishInactiveRounds/getInactiveRounds'
import logger from '@aces/lib/logger'


export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json('Unauthorized', { status: 401 })
  }

  const updatedRounds = await getInactiveRounds()
  logger.info(`Updated ${updatedRounds} rounds`)
  return NextResponse.json({ success: true })
}
