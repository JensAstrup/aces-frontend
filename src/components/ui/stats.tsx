import { Card, CardContent, CardHeader, CardTitle } from '@aces/components/ui/card'


const stats = [
  { title: 'Lowest', value: 0 },
  { title: 'Median', value: 3.5 },
  { title: 'Average', value: 3.5 },
  { title: 'Highest', value: 8 },
]

const Stats: React.FC = () => {
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
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export { Stats }
