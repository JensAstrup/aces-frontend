'use server'
import { NextResponse } from 'next/server'

import getIssuesForTeam from '@aces/lib/linear/get-issues-for-team'


interface TeamRouteProps {
    params: { teamId: string }
}

async function POST(request: Request, { params }: TeamRouteProps) {
  const issues = await getIssuesForTeam(params.teamId)
  return NextResponse.json(issues, { status: 200 })
}

export { POST }
