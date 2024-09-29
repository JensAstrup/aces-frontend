import useSWR from 'swr'

import { View } from '@aces/interfaces/view'
import { getCsrfToken, useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


async function getViews(): Promise<View[]> {
  const { csrfToken } = await getCsrfToken()
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const data = await fetcher(`${API_URL}/views`, csrfToken)
  return data
}

async function fetcher(url: string, csrfToken: string): Promise<View[]> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch favorite views')
  }
  return response.json()
}

export function useGetFavoriteViews() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { csrfToken, isLoading: csrfLoading, isError: csrfError } = useCsrfToken()

  const { data, error, isLoading } = useSWR([`${API_URL}/views`, csrfToken], ([url, csrfToken]: [string, string]) => {
    return fetcher(url, csrfToken)
  }
  )

  return {
    favoriteViews: data,
    isLoading: isLoading || csrfLoading,
    isError: error || csrfError,
  }
}

export default useGetFavoriteViews
export { getViews }
