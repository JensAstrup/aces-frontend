'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'


const useOAuthRedirect = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthCalled, setIsAuthCalled] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')

    if (code && !isAuthCalled) {
      setIsAuthCalled(true)
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            localStorage.setItem('accessToken', data.accessToken)
            router.push('/voting')
          })
        }
        else {
          throw new Error('Failed to exchange code for access token')
        }
      }).catch((error) => {
        console.error(error)
      })
    }
  }, [searchParams, isAuthCalled, router])

  return { isAuthCalled }
}

export default useOAuthRedirect
