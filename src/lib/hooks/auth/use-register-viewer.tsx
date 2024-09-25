import useSWR from 'swr'

import User from '@aces/interfaces/user'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


interface ViewerData {
  roundId: string
}

async function fetcher(url: string, viewerData: ViewerData, csrfToken: string) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(viewerData),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to register viewer')
  }

  return response.json()
}

function useRegisterViewer(viewerData: ViewerData, user: User | null | undefined) {
  const shouldRegister = user === null || user?.linearId === null
  const { csrfToken, isLoading: csrfLoading, isError: csrfError } = useCsrfToken()

  const { data, error, isValidating } = useSWR<User | undefined>(
    shouldRegister && csrfToken ? [`${process.env.NEXT_PUBLIC_API_URL}/auth/anonymous`, viewerData, csrfToken] : null,
    ([url, viewerData, csrfToken]: [string, ViewerData, string]) => fetcher(url, viewerData, csrfToken),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  )

  const isLoading = shouldRegister && ((!data && !error && !csrfError) || isValidating || csrfLoading)

  return {
    data,
    isRegistered: !!data,
    isLoading,
    error: shouldRegister ? error : null,
  }
}

export default useRegisterViewer
