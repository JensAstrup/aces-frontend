import { WifiOffIcon } from 'lucide-react'

import RefreshViewButton from '@aces/components/disconnected/refresh-view-button'
import { Card, CardContent, CardFooter } from '@aces/components/ui/card'


function Disconnected() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 pb-2 text-center">
          <WifiOffIcon className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Disconnected</h2>
          <p className="text-muted-foreground mb-4">
            You have been disconnected from the round.
            <br />
            Please reload the page to reconnect.
          </p>
        </CardContent>
        <CardFooter>
          <RefreshViewButton />
        </CardFooter>
      </Card>
    </div>
  )
}

export default Disconnected
