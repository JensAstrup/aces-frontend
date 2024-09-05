import useSWR from 'swr'

import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import { HttpStatusCodes } from '@aces/lib/utils/http-status-codes'


async function setRoundIssueFetcher(url: string, issueId: string, csrfToken: string) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    credentials: 'include',
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
  const { csrfToken, isLoading: csrfLoading, isError: csrfError } = useCsrfToken()

  const shouldFetch = !!roundId && !!issueId && !!csrfToken
  const requestParams: [string, string, string] | null = shouldFetch ? [`${API_URL}/rounds/${roundId}/issue`, issueId, csrfToken] : null
  const result = useSWR(requestParams, ([url, issueId, csrfToken]) => {
    return setRoundIssueFetcher(url, issueId, csrfToken)
  })
  return {
    data: result.data,
    error: result.error || csrfError,
    isLoading: result.isLoading || csrfLoading,
  }
}

export default useSetRoundIssue
export { setRoundIssueFetcher }
