import { Button } from '@aces/components/ui/button'


interface VoteProps {
  votes: Array<number | null>
    expectedVotes: number
}

function Votes({ votes, expectedVotes }: VoteProps): JSX.Element {
  if (votes.length === 0) {
    return <></>
  }

  const turnCompleted = votes.length === expectedVotes

  return (
    <div>
      <h2 className="text-2xl font-bold">Votes</h2>
      <div className="grid grid-cols-3 gap-4">
        {votes.map((vote, index) => (
          <Button className="flex items-center justify-center bg-primary rounded-md p-4" key={index} size="lg">{vote === null ? 'Abstain' : turnCompleted ? vote : '?'}</Button>
        ))}
        {Array.from({ length: expectedVotes - votes.length }).map((_, index) => (
          <Button className="flex items-center justify-center bg-gray-200 rounded-md p-4" disabled={true} key={index} size="lg">?</Button>
        ))}
      </div>
    </div>
  )
}

export default Votes
