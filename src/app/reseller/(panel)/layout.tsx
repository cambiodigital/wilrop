import type { ReactNode } from 'react'
import ResellerSidebar from '@/components/reseller/ResellerSidebar'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'

export default async function ResellerPanelLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
  const session = verifyPanelSessionToken(sessionValue, 'reseller')

  if (!session) {
    redirect('/reseller/login')
  }

  return <ResellerSidebar resellerName={session.name}>{children}</ResellerSidebar>
}
