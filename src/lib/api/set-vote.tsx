import useSWRMutation from 'swr/mutation'


type VoteResponse = {
  success: boolean
}

type VoteError = {
  message: string
}

async function fetcher(url: string, { arg }: { arg: { point: number, issueId: string } }): Promise<VoteResponse> {
  const accessToken = localStorage.getItem('accessToken')
  const guestToken = localStorage.getItem('guestToken')
  if (!accessToken && !guestToken) {
    throw new Error('Access token not found')
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${accessToken || guestToken}`,
    },
    body: JSON.stringify({ vote: arg.point, issueId: arg.issueId }),
  })

  if (!response.ok) {
    const errorData: VoteError = await response.json()
    throw new Error(errorData.message || 'Failed to vote')
  }

  return response.json()
}

export function useVote(roundId: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/rounds/${roundId}/vote`

  const { trigger, isMutating, error } = useSWRMutation<VoteResponse, Error, string, { point: number, issueId: string }>(
    url,
    fetcher
  )

  return {
    trigger: async (args: { point: number, issueId: string }) => {
      if (!args.point || !args.issueId) {
        return { error: 'Point or issueId is missing' }
      }
      try {
        const result = await trigger(args)
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
