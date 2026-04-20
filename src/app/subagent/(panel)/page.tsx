import SubagentDashboard from '@/components/subagent/SubagentDashboard'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'

export default async function SubagentDashboardPage() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(getPanelSessionCookieName('subagent'))?.value
  const session = verifyPanelSessionToken(sessionValue, 'subagent')

  return (
    <SubagentDashboard
      session={session ? { id: session.id, name: session.name, code: session.code || '', commission: session.commission || 0 } : undefined}
    />
  )
}
