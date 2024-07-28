
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
  const params = accessToken ? [`${process.env.NEXT_PUBLIC_API_URL}/rounds`, accessToken] : null
  const { data: roundId, error, mutate } = useSWR<string, Error>(
    params, fetcher, { revalidateOnFocus: false, shouldRetryOnError: false }
  )

  return {
    roundId,
    isLoading: !error && !roundId,
    isError: error,
    mutate
  }
}

export default useCreateRound
