'use client'
import React, { Suspense } from 'react'

import useOAuthRedirect from '@aces/app/oauth/callback/oauth-redirect'


const OAuthRedirectContent = () => {
  useOAuthRedirect()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <h1>OAuth Redirect Page</h1>
        <p>Processing your authentication...</p>
      </div>
    </Suspense>
  )
}

export default OAuthRedirectContent
