import React from 'react'

import { Icons } from '@aces/components/icons'


function RoundError() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
      <Icons.octagonX className="h-12 w-12" />
      <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">An Error Occurred</h2>
      <p className="mt-10 text-l"> This issue has been logged and we will investigate.</p>
      <p className="mt-10 text-l"> In the meantime, you can try to clear your cookies and refresh. </p>
    </div>
  )
}

export default RoundError
