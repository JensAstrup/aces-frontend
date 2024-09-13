import { User } from '@prisma/client'
import useSWR from 'swr'

import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import { HttpStatusCodes } from '@aces/lib/utils/http-status-codes'


async function fetchCurrentUser(url: string, csrfToken: string) {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    }
  })
  if (response.status === HttpStatusCodes.UNAUTHORIZED) {
    return null // Return null for anonymous users
  }
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
    user: data as User | undefined,
    isLoading: isLoading || isCsrfLoading,
    error: isCsrfError || error,
  }
}

export default useCurrentUser
export { fetchCurrentUser }
