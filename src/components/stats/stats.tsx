'use client'
import * as Sentry from '@sentry/react'
import React, { useCallback, useRef } from 'react'

import StatCard from '@aces/components/stats/stat-card'
import { Toaster } from '@aces/components/ui/toaster'
import { useToast } from '@aces/components/ui/use-toast'
import setEstimate from '@aces/lib/actions/estimate'
import { useCurrentUser } from '@aces/lib/hooks/auth/use-current-user'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import { calculateStats } from '@aces/lib/utils/calculate-stats'
import roundToNearestFibonacci from '@aces/lib/utils/closest-fibonacci-number'


interface StatsProps {
    votes: Array<number | null>
}

function Stats({ votes }: StatsProps) {
  const { currentIssue } = useIssues()
  const { user } = useCurrentUser()
  const { toast } = useToast()
  const submittingEstimate = useRef(false)

  const { lowest, highest, median, average } = calculateStats(votes)

  const stats: Array<{ title: string, value: number }> = [
    { title: 'Lowest', value: lowest },
    { title: 'Median', value: median },
    { title: 'Average', value: Number(average.toFixed(0)) },
    { title: 'Highest', value: highest },
  ]

  const setEstimateOnClick = useCallback(
    async (value: number) => {
      if (!currentIssue?.id || submittingEstimate.current) return
      const fibonacciValue = roundToNearestFibonacci(value)
      submittingEstimate.current = true
      try {
        await setEstimate(currentIssue.id, fibonacciValue)
        toast({
          title: 'Estimate set',
          description: `Estimate set successfully to ${fibonacciValue}`,
          duration: 3000,
        })
      }
      catch (error) {
        toast({
          title: 'Error',
          description: 'An error occurred while setting the estimate',
          duration: 5000,
          variant: 'destructive',
        })
        Sentry.captureException(error)
      }
      finally {
        submittingEstimate.current = false
      }
    },
    [currentIssue, toast]
  )

  if (votes.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Stats</h2>
      <div className="grid grid-cols-4 gap-3">
        {stats.map(stat => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            hoverValue={roundToNearestFibonacci(stat.value)}
            onClick={() => user?.linearId ? setEstimateOnClick(stat.value) : null}
            disabled={submittingEstimate.current}
          />
        ))}
      </div>
      <Toaster />
    </div>
  )
}

export default Stats
