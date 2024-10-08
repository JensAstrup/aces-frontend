'use server'
import 'server-only'
import { LinearClient } from '@linear/sdk'

import getSession from '@aces/lib/server/auth/session'
import decrypt from '@aces/lib/utils/decrypt'


async function setEstimate(issueId: string, estimate: number) {
  const session = await getSession()
  const user = session.user!
  if (!user.token) {
    return { message: 'No token found' }
  }
  const token = decrypt(user.token)
  const linearClient = new LinearClient({ accessToken: token })
  await linearClient.updateIssue(issueId, { estimate })
  return { message: 'Estimate saved successfully' }
}

export default setEstimate
