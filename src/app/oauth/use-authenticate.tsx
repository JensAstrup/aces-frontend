import { useCallback, useRef, useState } from 'react'

import createRound from '@aces/app/rounds/createRound'


function useAuth() {
  const [isAuthCalled, setIsAuthCalled] = useState(false)
  const authCalledRef = useRef(false)

  const handleAuth = useCallback(async (code: string) => {
    if (authCalledRef.current) return
    authCalledRef.current = true

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('accessToken', data.accessToken)
        const roundId = await createRound()
        setIsAuthCalled(true)
        return roundId
      }
      else {
        throw new Error('Failed to exchange code for access token')
      }
    }
    catch (error) {
      console.error(error)
      authCalledRef.current = false
      throw error
    }
  }, [])

  return { handleAuth, isAuthCalled }
}

export default useAuth
