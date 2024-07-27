import React from 'react'
import useSWR from 'swr'

import User from '@aces/interfaces/user'


interface ViewerData {
  roundId: string
}

async function fetcher(url: string, viewerData: ViewerData) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(viewerData),
  })

  if (!response.ok) {
    throw new Error('Failed to register viewer')
  }

  return response.json()
}

function useRegisterViewer(viewerData: ViewerData, user: User | null | undefined) {
  const shouldRegister = user === null

  const { data, error, isValidating } = useSWR(
    user === undefined || user ? null : [`${process.env.NEXT_PUBLIC_API_URL}/auth/anonymous`, viewerData],
    ([url, data]) => fetcher(url, data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  )

  const isLoading = (!data && !error) || isValidating

  // Save token to localStorage when data is available and user is registered
  React.useEffect(() => {
    if (data && data.user.token) {
      localStorage.setItem('guestToken', data.user.token)
    }
  }, [data])

  return {
    data,
    isRegistered: !!data,
    isLoading,
    error: shouldRegister ? error : null,
  }
}

export default useRegisterViewer
