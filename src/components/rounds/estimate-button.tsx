import { Loader2 } from 'lucide-react'
import React from 'react'

import { Button } from '@aces/components/ui/button'


interface EstimateProps {
  value: number | null
  display: string
}


interface EstimateButtonProps {
  point: EstimateProps
  onClick?: () => Promise<void>
  disabled?: boolean
  loading?: boolean
  className?: string
}


function EstimateButton(props: EstimateButtonProps) {
  return (
    <Button
      className={props.className}
      data-point={props.point.value}
      onClick={props.onClick}
      size="lg"
      disabled={props.disabled}
    >
      {props.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : props.point.display}
    </Button>
  )
}

export default EstimateButton
export type { EstimateProps, EstimateButtonProps }
