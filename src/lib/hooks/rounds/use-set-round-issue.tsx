import useSWR from 'swr'


const API_URL: string = process.env.NEXT_PUBLIC_API_URL!

async function setRoundIssueFetcher(url: string, roundId: string, issueId: string) {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    throw new Error('No access token found')
  }
  const response = await fetch(`${API_URL}/rounds/${roundId}/issue`, {
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
  return response.json()
}

function useSetRoundIssue(roundId: string, issueId: string) {
  const shouldFetch = !!roundId && !!issueId
  const { data, error, isLoading } = useSWR(shouldFetch ? [`${API_URL}/rounds/${roundId}/issue`, roundId, issueId] : null, ([url, roundId, issueId]) => {
    return setRoundIssueFetcher(url, roundId, issueId)
  })
  return {
    data,
    error,
    isLoading
  }
}

export default useSetRoundIssue
export { setRoundIssueFetcher }
