import useSWR from 'swr'

import { View } from '@aces/interfaces/view'


const API_URL = process.env.NEXT_PUBLIC_API_URL

async function fetcher(url: string, token: string): Promise<View[]> {
  const response = await fetch(url, {
    headers: {
      Authorization: token,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch favorite views')
  }
  return response.json()
}

export function useGetFavoriteViews(token: string) {
  const { data, error, isLoading } = useSWR([`${API_URL}/views`, token], ([url, token]) => {
    return fetcher(url, token)
  }
  )

  return {
    favoriteViews: data,
    isLoading,
    isError: error
  }
}

export default useGetFavoriteViews
