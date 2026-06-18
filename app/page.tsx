import { auth } from '@/auth'
import { LandingPage } from '@/components/LandingPage'

export default async function Page() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === 'admin'
  return <LandingPage isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
}
