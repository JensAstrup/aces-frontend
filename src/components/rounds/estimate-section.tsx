import * as Sentry from '@sentry/nextjs'
import React from 'react'

import EstimateButton, { EstimateProps } from '@aces/components/rounds/estimate-button'
import { Button } from '@aces/components/ui/button'
import { Toaster } from '@aces/components/ui/toaster'
import { useToast } from '@aces/components/ui/use-toast'
import { Issue } from '@aces/interfaces/issue'
import useVote from '@aces/lib/api/set-vote'


interface EstimateSectionProps {
  roundId: string
  issue: Issue | null
  isLoading: boolean
}


function EstimateSection({ roundId, issue, isLoading }: EstimateSectionProps) {
  const { toast } = useToast()
  const { trigger, isMutating } = useVote(roundId)

  async function handleVote(voteNumber: number | null) {
    if (!issue || !issue.id) {
      Sentry.captureException(new Error('No issue or issue ID available'))
      toast({
        title: 'Error',
        description: 'Unable to vote: No issue selected',
        duration: 5000,
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await trigger({ point: voteNumber, issueId: issue.id })
      if (result.error) {
        throw new Error(result.error)
      }
      toast({
        title: 'Success',
        description: 'Your vote has been recorded',
        duration: 3000,
      })
    }
    catch (error) {
      Sentry.captureException('Error setting vote')
      toast({
        title: 'Error',
        description: 'An error occurred while setting the vote',
        duration: 5000,
        variant: 'destructive',
      })
    }
  }

  if (!issue) {
    return <div>No issue selected</div>
  }

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Estimate</h2>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2, 3, 5, 8].map(point => (
            <Button key={point} disabled={true} />
          ))}
        </div>
      </div>
    )
  }

  const buttons: EstimateProps[] = [
    { value: null, display: 'Abstain' },
    { value: 1, display: '1' },
    { value: 2, display: '2' },
    { value: 3, display: '3' },
    { value: 5, display: '5' },
    { value: 8, display: '8' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold">Estimate</h2>
      <div className="grid grid-cols-3 gap-4">
        {buttons.map((point, index) => (
          <EstimateButton key={index} point={point} onClick={() => handleVote(point.value)} disabled={isMutating} />
        ))}
      </div>
      <Toaster />
    </div>
  )
}

export default EstimateSection
