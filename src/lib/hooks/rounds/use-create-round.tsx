'use client'
import useSWR from 'swr'

import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


const fetcher = async (url: string, csrfToken: string): Promise<string> => {
  console.log('fetcher', url, csrfToken)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Failed to create round')

  const data = await response.json()
  localStorage.setItem('round', data.id)
  return data.id
}

function useCreateRound(shouldFetch: boolean) {
  const { csrfToken, isLoading: isCsrfLoading, isError: isCsrfError } = useCsrfToken()

  const { data: roundId, error, mutate } = useSWR(
    shouldFetch && csrfToken ? [`${process.env.NEXT_PUBLIC_API_URL}/rounds`, csrfToken] : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  )

  return {
    roundId,
    isLoading: shouldFetch && (!roundId || isCsrfLoading) && !error && !isCsrfError,
    isError: !!error || isCsrfError,
    mutate,
  }
}

export default useCreateRound
