import { Card, CardContent, CardHeader, CardTitle } from '@aces/components/ui/card'
import getMedian from '@aces/lib/utils/get-median'


interface StatsProps {
    votes: Array<number | null>
}

function Stats({ votes }: StatsProps): JSX.Element {
  if (votes.length === 0) {
    return <></>
  }

  const filteredVotes = votes.filter(vote => vote !== null)
  let lowest = Math.min(...filteredVotes)
  let highest = Math.max(...filteredVotes)
  let median = getMedian(filteredVotes)
  let average = filteredVotes.reduce((acc, vote) => acc + vote, 0) / filteredVotes.length

  if (filteredVotes.length === 0) {
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
