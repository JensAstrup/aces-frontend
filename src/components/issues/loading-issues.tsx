import React from 'react'

import { Icons } from '@aces/components/icons'


function LoadingIssues() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
      <h2 className="font-bold font-heading text-xl">Retrieving Issues...</h2>
      <Icons.spinner className="h-8 w-8 animate-spin" />
    </div>
  )
}

export default LoadingIssues
