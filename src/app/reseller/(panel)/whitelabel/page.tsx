import WhiteLabelCreator from '@/components/whitelabel/WhiteLabelCreator'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getResellerCapabilities } from '@/lib/reseller-access'

export default async function ResellerWhiteLabelPage() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
  const session = verifyPanelSessionToken(sessionValue, 'reseller')
  const capabilities = getResellerCapabilities({
    sellerLevel: session?.appRole,
    whiteLabelEnabled: session?.whiteLabelEnabled,
  })

  if (!capabilities.canUseWhiteLabel) {
    redirect('/reseller')
  }

  return <WhiteLabelCreator />
}
