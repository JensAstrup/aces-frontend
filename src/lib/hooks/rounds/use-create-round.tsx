'use client'
import useSWR from 'swr'


const fetcher = async (url: string, accessToken: string): Promise<string> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': accessToken
    },
  })

  if (!response.ok) throw new Error('Failed to create round')

  const data = await response.json()
  localStorage.setItem('round', data.id)
  return data.id
}

const useCreateRound = (shouldFetch: boolean) => {
  const accessToken = localStorage.getItem('accessToken')
  const { data: roundId, error, mutate } = useSWR<string, Error>(
    shouldFetch ? [`${process.env.NEXT_PUBLIC_API_URL}/rounds`, accessToken] : null, ([url, accessToken]: [string, string]) => fetcher(url, accessToken),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  )

  return {
    roundId,
    isLoading: shouldFetch && !error && !roundId,
    isError: !!error,
    mutate
  }
}

export default useCreateRound
