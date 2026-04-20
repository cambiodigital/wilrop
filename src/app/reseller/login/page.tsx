import ResellerLogin from '@/components/reseller/ResellerLogin'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'

export default async function ResellerLoginPage() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
  const session = verifyPanelSessionToken(sessionValue, 'reseller')

  if (session) {
    redirect('/reseller')
  }

  return <ResellerLogin />
}
