import type { ReactNode } from 'react'
import ResellerSidebar from '@/components/reseller/ResellerSidebar'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getResellerCapabilities } from '@/lib/reseller-access'

export default async function ResellerPanelLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
  const session = verifyPanelSessionToken(sessionValue, 'reseller')

  if (!session) {
    redirect('/reseller/login')
  }

  const capabilities = getResellerCapabilities({
    sellerLevel: session.appRole,
    whiteLabelEnabled: session.whiteLabelEnabled,
  })

  return (
    <ResellerSidebar resellerName={session.name} canUseWhiteLabel={capabilities.canUseWhiteLabel}>
      {children}
    </ResellerSidebar>
  )
}
