'use client'
import { Button } from '@aces/components/ui/button'


function RefreshViewButton() {
  return (
    <Button
      onClick={() => {
        window.location.reload()
      }}
      className="w-full"
    >
      Reload Page
    </Button>
  )
}

export default RefreshViewButton
