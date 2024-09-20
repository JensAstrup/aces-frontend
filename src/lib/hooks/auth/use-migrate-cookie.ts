import * as Sentry from '@sentry/react'
import useSWR from 'swr'


async function migrateCookie(csrfToken: string) {
  const response = await fetch('/api/auth/migrate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ csrfToken })
  })

  if (!response.ok) {
    const error = new Error('Failed to migrate cookie')
    Sentry.captureException(error)
    throw error
  }

  return response.json()
}

function useMigrateCookie(csrfToken: string): void {
  useSWR(csrfToken ? ['/api/auth/migrate', csrfToken] : null, () => migrateCookie(csrfToken))
}

export default useMigrateCookie
