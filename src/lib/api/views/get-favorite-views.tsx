import { View } from '@aces/interfaces/view'


async function getFavoriteViews(token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/views`, {
    headers: {
      Authorization: token,
    },
  })
  const data = await response.json()
  return data as View[]
}

export default getFavoriteViews
export type { View }
