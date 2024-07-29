import useSWR, { SWRResponse } from 'swr'

import { View } from '@aces/interfaces/view'


const fetcher = async (url: string, accessToken: string) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('An error occurred while fetching the data.')
  }

  return response.json()
}


function useGetIssuesForView(selectedView: View | null) {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    throw new Error('No access token found')
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const result: SWRResponse | undefined = useSWR(selectedView?.id ? [`${API_URL}/views/${selectedView.id}/issues`, accessToken] : null, ([url, accessToken]) => {
    return fetcher(url, accessToken)
  })
  return {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    data: result?.data,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    error: result?.error,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    isLoading: result?.isLoading,
  }
}

export default useGetIssuesForView
