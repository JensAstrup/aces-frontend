import { Button } from '@aces/components/ui/button'
import Link from 'next/link'

export default function Home() {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md text-center">
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Ace of Spades</h1>
              <Button className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <Link
                    href="#"
                    className=""
                    prefetch={false}
                  >
                      Sign in
                  </Link>
              </Button>
          </div>
      </div>
    );
}
