import useSWRMutation from 'swr/mutation'


interface SubmitEstimateParams {
  issueId: string
  estimate: number
}

interface SubmitEstimateResponse {
  message: string
}

async function submitEstimateFetcher(url: string, { arg }: { arg: SubmitEstimateParams }
) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(arg),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export function useSubmitEstimate() {
  const {
    trigger,
    data,
    error,
    isMutating
  } = useSWRMutation<SubmitEstimateResponse, Error, string, SubmitEstimateParams>(
    '/api/estimate/submit',
    submitEstimateFetcher
  )

  const submitEstimate = async (issueId: string, estimate: number) => {
    return await trigger({ issueId, estimate })
  }

  return {
    data,
    isLoading: isMutating,
    error,
    submitEstimate,
  }
}

export default useSubmitEstimate
export { submitEstimateFetcher }
