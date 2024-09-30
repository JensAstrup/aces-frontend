'use client'
import { Button } from '@aces/components/ui/button'


function RefreshViewButton() {
  const handleRefresh = () => {
    window.location.reload()
  }
  return (
    <Button onClick={handleRefresh} className="w-full">
      Reload Page
    </Button>
  )
}

export default RefreshViewButton
