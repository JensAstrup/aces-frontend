import { Card, CardContent, CardHeader, CardTitle } from '@aces/components/ui/card'
import getMedian from '@aces/lib/utils'


interface StatsProps {
    votes: number[]
    expectedVotes: number
}

function Stats({ votes, expectedVotes }: StatsProps): JSX.Element {
  if (votes.length === 0) {
    return <></>
  }

  const totalVotes = votes.length
  let lowest = Math.min(...votes)
  let highest = Math.max(...votes)
  let median = getMedian(votes)
  let average = votes.reduce((acc, vote) => acc + vote, 0) / totalVotes
  console.log('median', median)
  if (totalVotes === 0) {
    lowest = 0
    highest = 0
    median = 0
    average = 0
  }

  const stats = [
    { title: 'Lowest', value: lowest },
    { title: 'Median', value: median },
    { title: 'Average', value: average.toFixed(0) },
    { title: 'Highest', value: highest },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold">Stats</h2>
      <div className="grid grid-cols-4 gap-3">
        {stats.map(stat => (
          <Card className="col-span-1" key={stat.title}>
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

export { Stats }
