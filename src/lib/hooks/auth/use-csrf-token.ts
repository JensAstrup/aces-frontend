import useSWR from 'swr'


async function getCsrfToken(): Promise<{ csrfToken: string }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/csrf-token`, { credentials: 'include' })

  if (!response.ok) {
    throw new Error('Failed to fetch CSRF token')
  }

  return response.json()
}

async function fetcher(url: string) {
  return fetch(url, { credentials: 'include' }).then(res => res.json())
}

function useCsrfToken() {
  const { data, error } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/auth/csrf-token`, fetcher, { revalidateOnFocus: false })

  return {
    csrfToken: data?.csrfToken,
    isLoading: !error && !data,
    isError: error,
  }
}

export { useCsrfToken }
export { getCsrfToken }
