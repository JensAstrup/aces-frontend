import EstimateButton from '@aces/components/estimates/estimate-button'
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

  function renderVote(vote: number | null, index: number) {
    const voteText: string | number = vote === null ? 'Abstain' : vote
    const voteDisplay: string | number = turnCompleted ? voteText : '?'
    return <Button className="flex items-center justify-center bg-primary rounded-md p-4" key={index} size="lg">{voteDisplay}</Button>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Votes</h2>
      <div className="grid grid-cols-3 gap-4">
        {votes.map(renderVote)}
        {Array.from({ length: expectedVotes - votes.length }).map((_, index) => (
          <EstimateButton className="flex items-center justify-center bg-gray-200 rounded-md p-4" key={index} point={{ value: null, display: '?' }} disabled={true} />
        ))}
      </div>
    </div>
  )
}

export default Votes
