import useSWR from 'swr'

import { HttpStatusCodes } from '@aces/lib/utils/http-status-codes'


async function setRoundIssueFetcher(url: string, issueId: string, accessToken: string) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': accessToken
    },
    body: JSON.stringify({ issue: issueId })
  })
  if (!response.ok) {
    throw new Error('Failed to set issue')
  }
  if (response.status === HttpStatusCodes.NO_CONTENT) {
    return null
  }
  return response.json()
}

function useSetRoundIssue(roundId: string, issueId: string) {
  const API_URL: string = process.env.NEXT_PUBLIC_API_URL!
  const accessToken = localStorage.getItem('accessToken')

  const shouldFetch = !!roundId && !!issueId && !!accessToken
  const requestParams: [string, string, string] | null = shouldFetch ? [`${API_URL}/rounds/${roundId}/issue`, issueId, accessToken] : null
  const result = useSWR(requestParams, ([url, issueId, accessToken]) => {
    return setRoundIssueFetcher(url, issueId, accessToken)
  })
  return {
    data: result.data,
    error: result.error,
    isLoading: result.isLoading,
  }
}

export default useSetRoundIssue
export { setRoundIssueFetcher }
