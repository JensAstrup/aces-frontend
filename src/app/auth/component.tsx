/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Vn8tEvlQhmc
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link"

export default function Component() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Ace of Spades</h1>
        <div className="mt-6">
          <Link
            href="#"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            prefetch={false}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
