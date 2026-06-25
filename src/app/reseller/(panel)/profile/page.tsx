import ResellerProfileForm from '@/components/reseller/ResellerProfileForm'
import ResellerPasswordChange from '@/components/reseller/ResellerPasswordChange'
import ResellerDocumentUpload from '@/components/reseller/ResellerDocumentUpload'
import ResellerWhiteLabelConfig from '@/components/reseller/ResellerWhiteLabelConfig'
import { Separator } from '@/components/ui/separator'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getResellerProfile } from '@/lib/reseller/profile'

export default async function ResellerProfilePage() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
  const session = verifyPanelSessionToken(sessionValue, 'reseller')

  if (!session) {
    redirect('/reseller/login')
  }

  const profile = await getResellerProfile(session.id)

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona tu información como revendedor</p>
      </div>

      <ResellerProfileForm initialData={profile} />

      <Separator />

      <ResellerPasswordChange />

      <Separator />

      <ResellerDocumentUpload documents={profile?.documents} />

      {profile?.whiteLabelEnabled && (
        <>
          <Separator />
          <ResellerWhiteLabelConfig
            enabled={profile.whiteLabelEnabled}
            contactName={profile?.contactName}
            companyName={profile?.companyName}
          />
        </>
      )}
    </div>
  )
}
