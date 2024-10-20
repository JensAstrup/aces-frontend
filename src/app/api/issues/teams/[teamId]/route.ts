'use server'
import getIssuesForTeam from '@aces/lib/linear/get-issues-for-team'
import getSession from '@aces/lib/server/auth/session'


interface TeamRouteProps {
    params: { teamId: string }
}

async function POST(request: Request, { params }: TeamRouteProps) {
  const issues = await getIssuesForTeam(params.teamId)
  return Response.json(issues)
}

export { POST }
