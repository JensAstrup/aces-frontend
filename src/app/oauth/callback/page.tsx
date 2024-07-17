import React from 'react'

import useOAuthRedirect from '@aces/app/oauth/callback/oauth-redirect'


const OAuthRedirectContent = () => {
  useOAuthRedirect()

  return (
    <div>
      <h1>OAuth Redirect Page</h1>
      <p>Processing your authentication...</p>
    </div>
  )
}

export default OAuthRedirectContent
