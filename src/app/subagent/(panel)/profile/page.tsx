import SubagentProfileForm from '@/components/subagent/SubagentProfileForm'
import SubagentPasswordChange from '@/components/subagent/SubagentPasswordChange'
import { Separator } from '@/components/ui/separator'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getSubagentProfile } from '@/lib/subagent/profile'

export default async function SubagentProfilePage() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(getPanelSessionCookieName('subagent'))?.value
  const session = verifyPanelSessionToken(sessionValue, 'subagent')

  if (!session) {
    redirect('/subagent/login')
  }

  const profile = await getSubagentProfile(session.id)

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona tu información como subagente</p>
      </div>

      <SubagentProfileForm initialData={profile} />

      <Separator />

      <SubagentPasswordChange />
    </div>
  )
}
