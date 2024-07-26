'use client'
import React from 'react'

import useOAuthRedirect from '@aces/app/oauth/callback/oauth-redirect'
import { Icons } from '@aces/components/icons'


const OAuthRedirectContent = () => {
  useOAuthRedirect()

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center justify-center items-center">
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Ace of Spades</h1>
        <p className="mt-10 text-xl"> Authenticating... </p>
        <div className="flex justify-center mt-4">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      </div>
    </div>
  )
}

export default OAuthRedirectContent
