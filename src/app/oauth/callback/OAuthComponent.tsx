'use client'
import React, { Suspense } from 'react'

import useOAuthRedirect from '@aces/app/oauth/callback/oauth-redirect'
import { Button } from '@aces/components/ui/button'


const OAuthRedirectContent = () => {
  useOAuthRedirect()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Ace of Spades</h1>
          <Button className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            Authenticating...
          </Button>
        </div>
      </div>
    </Suspense>
  )
}

export default OAuthRedirectContent
