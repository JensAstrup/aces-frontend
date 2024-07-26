import useSWR from 'swr'

import User from '@aces/interfaces/user'


interface ViewerData {
  roundId: string
}

const fetcher = async (url: string, viewerData: ViewerData) => {
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

const useRegisterViewer = (viewerData: ViewerData, user: User | null | undefined) => {
  const shouldRegister = user === null

  const { data, error } = useSWR(
    user === undefined || user ? null : [`${process.env.NEXT_PUBLIC_API_URL}/auth/anonymous`, viewerData],
    ([url, data]) => fetcher(url, data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  )

  return {
    data,
    isRegistered: !!data,
    error: shouldRegister ? error : null,
  }
}

export default useRegisterViewer
