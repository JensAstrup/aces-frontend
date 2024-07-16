import Link from 'next/link'

import { Button } from '@aces/components/ui/button'


export default function Home() {
  const clientId = '356a5310c2f662b9bb4a5f8e487c8357'
  const redirectUri = 'http://localhost:3000/auth/callback'
  const scope = 'read'
  const state = '1234567890'
  const responseType = 'code'
  const linearAuthUrl = `https://linear.app/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_type=${responseType}`
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Ace of Spades</h1>
        <Button className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Link href={linearAuthUrl} className="" prefetch={false}>Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
