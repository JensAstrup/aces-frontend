import { Button } from '@aces/components/ui/button'
import { useVotes } from '@aces/lib/hooks/votes/use-votes'


const Votes: React.FC = () => {
  const { votes } = useVotes()

  return (
    <div>
      <h2 className="text-2xl font-bold">Votes</h2>
      <div className="grid grid-cols-3 gap-4">
        {votes.map(vote => (
          <Button className="flex items-center justify-center bg-primary rounded-md p-4" key={vote} size="lg">{vote}</Button>
        ))}
      </div>
    </div>
  )
}

export { Votes }
