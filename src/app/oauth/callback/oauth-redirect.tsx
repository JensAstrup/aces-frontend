'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import useAuth from '@aces/app/oauth/use-authenticate'
import createRound from '@aces/app/rounds/createRound'


const useOAuthRedirect = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleAuth, isAuthCalled } = useAuth()


  useEffect(() => {
    const code = searchParams.get('code')
    if (code && !isAuthCalled) {
      handleAuth(code)
        .then(() => {
          createRound().then((roundId) => {
            console.log('roundId', roundId)
            if (roundId) {
              router.push(`/rounds/${roundId}`)
            }
          })
            .catch((error) => {
              console.error('Authentication failed:', error)
              // Handle error (e.g., redirect to error page)
            })
        })
    }
  }, [searchParams, isAuthCalled, handleAuth, router])

  return { isAuthCalled }
}

export default useOAuthRedirect
