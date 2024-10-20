import { Issue } from '@linear/sdk'
import useSWR, { SWRResponse } from 'swr'

import { View } from '@aces/interfaces/view'
import { getCsrfToken, useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


async function getIssuesForView(viewId: string): Promise<{ issues: Issue[], nextPage: string }> {
  const { csrfToken } = await getCsrfToken()
  const issues = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/views/${viewId}/issues`, csrfToken)
  return issues
}

const fetcher = async (url: string, csrfToken: string) => {
  const response = await fetch(url, {
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


function useGetIssuesForView(selectedView: View | null) {
  const { csrfToken, isLoading: csrfLoading, isError: csrfError } = useCsrfToken()

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const result: SWRResponse | undefined = useSWR(selectedView?.id ? [`${API_URL}/views/${selectedView.id}/issues`, csrfToken] : null, ([url, csrfToken]) => {
    return fetcher(url, csrfToken)
  })
  return {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    data: result?.data,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    error: result?.error || csrfError,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    isLoading: result?.isLoading || csrfLoading,
  }
}

export default useGetIssuesForView
export { getIssuesForView }
