import { useCallback, useRef, useState } from 'react'

import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


function useAuth() {
  const [isAuthCalled, setIsAuthCalled] = useState(false)
  const authCalledRef = useRef(false)
  const { csrfToken, isLoading, isError } = useCsrfToken()

  const handleAuth = useCallback(async (code: string): Promise<void> => {
    if (authCalledRef.current || isLoading || !csrfToken) {
      return Promise.reject(new Error('Authentication already in progress or CSRF token not available'))
    }

    authCalledRef.current = true
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ code }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for access token')
      }
      setIsAuthCalled(true)
    }
    catch (error) {
      console.error(error)
      authCalledRef.current = false
      throw error
    }
  }, [csrfToken, isLoading])

  return { handleAuth, isAuthCalled, isLoading, isError }
}

export default useAuth
