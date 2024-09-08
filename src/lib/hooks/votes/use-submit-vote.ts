import * as Sentry from '@sentry/nextjs'

import { useToast } from '@aces/components/ui/use-toast'
import { Issue } from '@aces/interfaces/issue'
import useVote from '@aces/lib/api/set-vote'


function useSubmitVote(roundId: string) {
  const { toast } = useToast()
  const { trigger, isMutating } = useVote(roundId)

  async function handleVote(voteNumber: number, issue: Issue | null) {
    if (!issue) {
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

  return { handleVote, isMutating }
}

export default useSubmitVote
