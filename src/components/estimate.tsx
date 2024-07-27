import { Button } from '@aces/components/ui/button'
import { Toaster } from '@aces/components/ui/toaster'
import { useToast } from '@aces/components/ui/use-toast'
import { Issue } from '@aces/interfaces/issue'
import { useVote } from '@aces/lib/api/set-vote'


interface EstimateProps {
    roundId: string
    issue: Issue
}

function Estimate({ roundId, issue }: EstimateProps) {
  const { toast } = useToast()

  const { trigger, isMutating } = useVote(roundId)

  async function handleVote(voteNumber: number) {
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
      toast({
        title: 'Error',
        description: 'An error occurred while setting the vote',
        duration: 5000,
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Estimate</h2>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2, 3, 5, 8].map(point => (
          <Button
            data-point={point}
            key={point}
            onClick={() => handleVote(point)}
            size="lg"
            disabled={isMutating}
          >
            {point}
          </Button>
        ))}
      </div>
      <Toaster />
    </div>
  )
}

export { Estimate }
