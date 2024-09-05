import useSWR from 'swr'


async function fetcher(url: string) {
  return fetch(url, { credentials: 'include' }).then(res => res.json())
}

function useCsrfToken() {
  const { data, error } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/auth/csrf-token`, fetcher)

  return {
    csrfToken: data?.csrfToken,
    isLoading: !error && !data,
    isError: error,
  }
}

export { useCsrfToken }
