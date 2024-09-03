import React from 'react'
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
  const shouldRegister = user === null
  const { csrfToken, isLoading: csrfLoading, isError: csrfError } = useCsrfToken()

  const { data, error, isValidating } = useSWR(
    user === undefined || user ? null : [`${process.env.NEXT_PUBLIC_API_URL}/auth/anonymous`, viewerData, csrfToken],
    ([url, data, csrfToken]) => fetcher(url, data, csrfToken),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  )

  const isLoading = (!data && !error && !!csrfError) || isValidating

  return {
    data,
    isRegistered: !!data,
    isLoading: isLoading || csrfLoading,
    error: shouldRegister ? error : null,
  }
}

export default useRegisterViewer
