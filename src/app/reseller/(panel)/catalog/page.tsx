import ResellerCatalogBrowser from '@/components/reseller/ResellerCatalogBrowser'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getResellerCapabilities } from '@/lib/reseller-access'

export default async function ResellerCatalogPage() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
  const session = verifyPanelSessionToken(sessionValue, 'reseller')

  const capabilities = session
    ? getResellerCapabilities({
        sellerLevel: session.appRole,
        whiteLabelEnabled: session.whiteLabelEnabled,
      })
    : { canCustomizePrices: false, maxCatalogItems: 0 }

  return (
    <div className="p-6 lg:p-8">
      <ResellerCatalogBrowser
        canCustomizePrices={capabilities.canCustomizePrices}
        maxCatalogItems={capabilities.maxCatalogItems}
      />
    </div>
  )
}
