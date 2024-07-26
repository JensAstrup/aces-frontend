import { useCallback, useState } from 'react'
import { mutate } from 'swr'


export function useAuth() {
  const [isAuthCalled, setIsAuthCalled] = useState(false)

  const handleAuth = useCallback(async (code: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for access token')
      }

      const data = await response.json()
      localStorage.setItem('accessToken', data.accessToken)
      setIsAuthCalled(true)

      // Trigger a revalidation of any authenticated requests
      mutate(key => typeof key === 'string' && key.startsWith(process.env.NEXT_PUBLIC_API_URL!))

      return data.accessToken
    }
    catch (error) {
      console.error('Authentication error:', error)
      throw error
    }
  }, [])

  return { handleAuth, isAuthCalled }
}
