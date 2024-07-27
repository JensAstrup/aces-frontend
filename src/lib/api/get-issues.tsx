import { IssuesApiResult } from '@aces/interfaces/issues-api-result'
import { View } from '@aces/interfaces/view'


async function getIssues(view: View, nextPage: string | null): Promise<IssuesApiResult> {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    throw new Error('No access token found')
  }
  let url: string = `${process.env.NEXT_PUBLIC_API_URL}/views/${view.id}/issues`
  if (nextPage) {
    url += `?nextPage=${nextPage}`
  }
  const response = await fetch(url, {
    headers: {
      Authorization: accessToken,
    },
  })
  return await response.json() as IssuesApiResult
}

export default getIssues
