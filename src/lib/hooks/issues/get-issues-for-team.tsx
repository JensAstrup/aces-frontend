import useSWR, { SWRResponse } from 'swr'

import { Issue } from '@aces/interfaces/issue'
import Team from '@aces/interfaces/team'
import { getCsrfToken, useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


async function fetchIssuesForTeam(teamId: string): Promise<{ issues: Issue[] }> {
  const csrfResponse = await getCsrfToken()
  if (!csrfResponse.csrfToken) {
    throw new Error('Failed to retrieve CSRF token.')
  }
  const { csrfToken } = csrfResponse
  const data = await fetcher(`/api/issues/teams/${teamId}`, csrfToken)
  return data
}

const fetcher = async (url: string, csrfToken: string) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('An error occurred while fetching the data.')
  }

  return response.json()
}


function useGetIssuesForTeam(selectedTeam: Team | null) {
  const { csrfToken, isLoading: csrfLoading, isError: csrfError } = useCsrfToken()
  const shouldFetch = selectedTeam?.id && csrfToken && !csrfLoading && !csrfError


  const result: SWRResponse | undefined = useSWR(
    shouldFetch ? [`api/issues/teams/${selectedTeam.id}`, csrfToken] : null,
    ([url, csrfToken]) => {
      return fetcher(url, csrfToken)
    }
  )

  return {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    data: result?.data,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    error: result?.error || csrfError,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    isLoading: result?.isLoading || csrfLoading,
  }
}

export default useGetIssuesForTeam
export { fetchIssuesForTeam }
