import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import useAuth from '@aces/lib/hooks/auth/use-authenticate'
import useCreateRound from '@aces/lib/hooks/rounds/use-create-round'


const useOAuthRedirect = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleAuth } = useAuth()
  const [authError, setAuthError] = useState<Error | null>(null)
  const [shouldCreateRound, setShouldCreateRound] = useState(false)

  const { roundId, isLoading, isError } = useCreateRound(shouldCreateRound)

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      handleAuth(code)
        .then(() => {
          let access_token
          try {
            access_token = localStorage.getItem('accessToken')
          }
          catch (err) {
            console.error(err)
          }
          setShouldCreateRound(!!access_token)
        })
        .catch((err) => {
          setAuthError(err)
        })
    }
  }, [searchParams, handleAuth])

  useEffect(() => {
    if (roundId) {
      console.log('Round created, redirecting:', roundId)
      router.push(`/rounds/${roundId}`)
    }
  }, [roundId, router])

  return {
    isLoading: isLoading || shouldCreateRound,
    error: authError || (isError ? new Error('Failed to create round') : null)
  }
}

export default useOAuthRedirect
