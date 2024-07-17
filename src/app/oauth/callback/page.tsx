import dynamic from 'next/dynamic'


const OAuthRedirect = dynamic(() => import('@aces/app/oauth/callback/OAuthComponent'), { ssr: false })


export default function OAuthCallbackPage() {
  return <OAuthRedirect />
}
