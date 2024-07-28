
import useSWR from 'swr'


const fetcher = async (url: string, accessToken: string): Promise<string> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': accessToken
    },
  })
  const data = await response.json()
  localStorage.setItem('round', data.id)
  return data.id
}

const useCreateRound = () => {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    throw new Error('No access token found')
  }
  const { data: roundId, error, mutate } = useSWR<string, Error>(
    `${process.env.NEXT_PUBLIC_API_URL}/rounds/`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  )

  return {
    roundId,
    isLoading: !error && !roundId,
    isError: error,
    mutate
  }
}

export default useCreateRound
