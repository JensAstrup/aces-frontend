import * as Sentry from '@sentry/react'

import { Card, CardContent, CardHeader, CardTitle } from '@aces/components/ui/card'
import setEstimate from '@aces/lib/actions/estimate'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import { calculateStats } from '@aces/lib/utils/calculate-stats'


interface StatsProps {
    votes: Array<number | null>
}

function Stats({ votes }: StatsProps): JSX.Element {
  const { currentIssue } = useIssues()
  const { user } = useCurrentUser()

  if (votes.length === 0) {
    return <></>
  }
  const { lowest, highest, median, average } = calculateStats(votes)

  const stats: Array<{ title: string, value: number }> = [
    { title: 'Lowest', value: lowest },
    { title: 'Median', value: median },
    { title: 'Average', value: Number(average.toFixed(0)) },
    { title: 'Highest', value: highest },
  ]

  function setEstimateOnClick(value: number) {
    if (!currentIssue || !currentIssue.id) {
      return
    }
    setEstimate(currentIssue.id, value).catch((error) => {
      Sentry.captureException(error)
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Stats</h2>
      <div className="grid grid-cols-4 gap-3">
        {stats.map(stat => (
          <Card
            className="col-span-1"
            key={stat.title}
            onClick={() => {
              if (user.linearId) return
              setEstimateOnClick(stat.value)
            }}
          >
            <CardHeader className="flex items-center justify-center">
              <CardTitle className="text-lg">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="text-3xl font-bold">{stat.value || '?'}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Stats
