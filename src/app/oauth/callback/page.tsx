'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

const OAuthRedirectContent = () => {
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')

    if (code) {
      // eslint-disable-next-line no-console
      console.log('OAuth code:', code)
      // You can add any additional logic here, e.g., sending the code to your server
    }
  }, [searchParams])

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
