import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import useAuth from '@aces/lib/hooks/auth/use-authenticate'
import useCreateRound from '@aces/lib/hooks/rounds/use-create-round'


const useOAuthRedirect = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleAuth, isLoading: isAuthLoading } = useAuth()
  const [authError, setAuthError] = useState<Error | null>(null)
  const [shouldCreateRound, setShouldCreateRound] = useState(false)

  const { roundId, isLoading: isRoundLoading, isError } = useCreateRound(shouldCreateRound)

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      handleAuth(code)
        .then(() => {
          setShouldCreateRound(true)
        })
        .catch((err) => {
          setAuthError(err)
        })
    }
  }, [searchParams, handleAuth])

  useEffect(() => {
    if (roundId) {
      router.push(`/rounds/${roundId}`)
    }
  }, [roundId, router])

  return {
    isLoading: isAuthLoading || isRoundLoading || shouldCreateRound,
    error: authError || (isError ? new Error('Failed to create round') : null)
  }
}

export default useOAuthRedirect
