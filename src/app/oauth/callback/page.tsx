'use client'

import React, { Suspense } from 'react'

import OAuthRedirectComponent from '@aces/app/oauth/callback/RedirectComponent'
import { Icons } from '@aces/components/icons'


export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={(
        <div className="flex items-center justify-center h-screen w-screen">
          <Icons.spinner className="animate-spin" />
        </div>
      )}
    >
      <OAuthRedirectComponent />
    </Suspense>
  )
}
