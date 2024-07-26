'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import useAuth from '@aces/app/oauth/use-authenticate'
import useCreateRound from '@aces/lib/hooks/use-create-round'


const useOAuthRedirect = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleAuth, isAuthCalled } = useAuth()
  const { roundId, isLoading, isError, mutate } = useCreateRound()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code && !isAuthCalled) {
      handleAuth(code)
        .then(() => {
          return mutate()
        })
        .catch((error) => {
          console.error('Authentication failed:', error)
          // Handle error (e.g., redirect to error page)
        })
    }
  }, [searchParams, isAuthCalled, handleAuth, mutate])

  useEffect(() => {
    if (roundId) {
      console.log('roundId', roundId)
      router.push(`/rounds/${roundId}`)
    }
  }, [roundId, router])

  return { isAuthCalled, isLoading, isError }
}

export default useOAuthRedirect
