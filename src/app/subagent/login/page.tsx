import SubagentLogin from '@/components/subagent/SubagentLogin'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'

export default async function SubagentLoginPage() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(getPanelSessionCookieName('subagent'))?.value
  const session = verifyPanelSessionToken(sessionValue, 'subagent')

  if (session) {
    redirect('/subagent')
  }

  return <SubagentLogin />
}
