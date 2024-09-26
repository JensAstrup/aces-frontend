'use server'
import { NextResponse } from 'next/server'

import setEstimate from '@aces/lib/estimates/api/estimate'


interface EstimateRequestBody {
  issueId: string
  estimate: number
}

async function POST(request: Request) {
  const body = await request.json() as EstimateRequestBody
  const { issueId, estimate } = body

  if (!issueId || !estimate) {
    return NextResponse.json('Missing issueId or estimate', { status: 400 })
  }

  await setEstimate(issueId, estimate)

  return NextResponse.json('Estimate saved successfully', { status: 200 })
}

export { POST }
