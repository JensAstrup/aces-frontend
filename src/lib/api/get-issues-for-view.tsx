import useSWR from 'swr'

import { View } from '@aces/interfaces/view'


const API_URL = process.env.NEXT_PUBLIC_API_URL

const fetcher = async (url: string) => {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    throw new Error('No access token found')
  }

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
  const { data, error, isLoading } = useSWR(selectedView?.id ? `${API_URL}/views/${selectedView.id}/issues` : null, (url) => {
    return fetcher(url)
  })
  return {
    data,
    error,
    isLoading
  }
}

export default useGetIssuesForView
