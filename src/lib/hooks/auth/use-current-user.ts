import useSWR from 'swr'

import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


async function fetchCurrentUser(url: string, csrfToken: string) {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    }
  })
  return response.json()
}

function useCurrentUser() {
  const { csrfToken, isLoading: isCsrfLoading, isError: isCsrfError } = useCsrfToken()

  const shouldFetch = !isCsrfLoading && !isCsrfError && csrfToken !== ''
  const { data, isLoading, error } = useSWR(
    shouldFetch ? [`${process.env.NEXT_PUBLIC_API_URL}/auth/user`, csrfToken] : null,
    ([url, token]: [string, string]) => fetchCurrentUser(url, token)
  )

  return {
    user: data,
    isLoading: isLoading || isCsrfLoading,
    error: isCsrfError || error,
  }
}

export default useCurrentUser
