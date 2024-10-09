import { LinearClient } from '@linear/sdk'
import { User } from '@prisma/client'

import { View } from '@aces/interfaces/view'
import decrypt from '@aces/lib/utils/decrypt'


async function getFavoriteViews(user: User): Promise<View[]> {
  if (!user.token) {
    return []
  }
  const accessToken = decrypt(user.token)
  const linear = new LinearClient({ accessToken })
  const favorites = await linear.favorites()
  const customFavorites = favorites.nodes.filter(favorite => favorite.type === 'customView')
  const customViews = await Promise.all(customFavorites.map(async favorite => await favorite.customView))
  const returnViews = customViews.map((view) => {
    if (!view) {
      return null
    }
    return { id: view.id, name: view.name } as View
  })
  return returnViews.filter(view => view !== null)
}

export default getFavoriteViews
