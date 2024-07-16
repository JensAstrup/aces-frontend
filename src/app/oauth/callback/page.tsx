'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

const OAuthRedirectContent = () => {
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
            router.push(`/issue`)
          })
        }
        throw new Error('Failed to exchange code for access token')
      })
    }
  }, [searchParams, isAuthCalled])

  return (
    <div>
      <h1>OAuth Redirect Page</h1>
      <p>Processing your authentication...</p>
    </div>
  )
}

const OAuthRedirect = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <OAuthRedirectContent />
  </Suspense>
)

export default OAuthRedirect
