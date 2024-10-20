'use server'
import 'server-only'
import { Issue, LinearClient, LinearRawResponse, TeamQuery } from '@linear/sdk'

import { issueFields } from '@aces/lib/linear/issue-fields'
import getSession from '@aces/lib/server/auth/session'
import decrypt from '@aces/lib/utils/decrypt'


async function getIssuesForTeam(teamId: string, nextPage?: string): Promise<{ issues: Issue[] }> {
  const session = await getSession()
  console.log(session)
  const user = session.user
  if (!user || !user.token) {
    throw new Error('User must be logged in')
  }
  const decryptedToken = decrypt(user.token)
  const client = new LinearClient({ accessToken: decryptedToken })
  const graphQlClient = client.client

  const query = `query issues($teamId: String!, $filter: IssueFilter, $nextPage: String) {
    team(id: $teamId) {
      id
      name
      issues(filter: $filter, first: 25, after: $nextPage) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
            ${issueFields}
          }
        }
      }
    }`
  const filter = {
    estimate: {
      null: true
    }
  }
  const issueConnection: LinearRawResponse<TeamQuery> = await graphQlClient.rawRequest(query, { teamId, filter, nextPage })
  // @ts-expect-error team does exist
  const issues = issueConnection.data.team.issues.nodes
  return { issues }
}

export default getIssuesForTeam
