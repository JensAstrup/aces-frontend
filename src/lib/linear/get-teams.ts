import { LinearClient, Team } from '@linear/sdk'
import { User } from '@prisma/client'

import decrypt from '@aces/lib/utils/decrypt'


async function getTeams(user: User): Promise<Team[]> {
  if (!user.token) {
    return []
  }
  const accessToken = decrypt(user.token)
  const linear = new LinearClient({ accessToken })
  const linearUser = await linear.viewer
  const teamConnection = await linearUser.teams()
  const teamNodes = teamConnection.nodes
  const teams = teamNodes.map((team) => {
    return {
      id: team.id,
      name: team.name
    } as Team
  })
  console.log(teams)
  return teams
}

export default getTeams
