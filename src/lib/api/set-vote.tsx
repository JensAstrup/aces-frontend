import useSWRMutation from 'swr/mutation'

import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'


type VoteResponse = {
  success: boolean
}

type VoteError = {
  message: string
}

interface VoteFetcherArgs {
    point: number | null
    issueId: string
    csrfToken: string
}

async function useVoteFetcher(url: string, { arg }: { arg: VoteFetcherArgs }): Promise<VoteResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': arg.csrfToken,
    },
    credentials: 'include',
    body: JSON.stringify({ vote: arg.point, issueId: arg.issueId }),
  })

  if (!response.ok) {
    const errorData: VoteError = await response.json()
    throw new Error(errorData.message || 'Failed to vote')
  }

  return response.json()
}


function useVote(roundId: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/rounds/${roundId}/vote`
  const { csrfToken, isLoading, isError } = useCsrfToken() // Fetch the CSRF token

  const { trigger, isMutating, error } = useSWRMutation<VoteResponse, Error, string, { point: number | null, issueId: string, csrfToken: string }>(
    url,
    useVoteFetcher
  )

  return {
    trigger: async (args: { point: number | null | undefined, issueId: string }) => {
      if (isLoading || isError) {
        return { error: 'CSRF token is not ready or failed to load' }
      }
      if (args.point === undefined || !args.issueId) {
        return { error: 'issueId is missing' }
      }
      try {
        // @ts-expect-error point is not undefined here
        const result = await trigger({ ...args, csrfToken }) // Pass the CSRF token to the trigger
        return { success: result.success }
      }
      catch (error) {
        if (error instanceof Error) {
          return { error: error.message }
        }
        return { error: 'An unknown error occurred' }
      }
    },
    isMutating,
    error,
  }
}

export default useVote
export { useVoteFetcher }
