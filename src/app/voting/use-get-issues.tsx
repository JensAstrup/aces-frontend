import { View } from '@aces/app/voting/get-favorite-views'


interface Issue {
    id: number
    title: string
    description: string
    state: {
      name: string
      type: string
    }
    comments: {
        nodes: {
            id: number
            body: string
            user: {
            id: number
            name: string
            avatarUrl: string
            }
        }[]
    }
    url: string
}

async function getIssues(view: View) {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    throw new Error('No access token found')
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/views/${view.id}/issues`, {
    headers: {
      Authorization: accessToken,
    },
  })
  const data = await response.json()
  return data as Issue[]
}

export default getIssues
export type { Issue }
