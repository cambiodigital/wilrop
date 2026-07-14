import type { ReactNode } from 'react'
import SubagentSidebar from '@/components/subagent/SubagentSidebar'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'

export default async function SubagentPanelLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(getPanelSessionCookieName('subagent'))?.value
  const session = verifyPanelSessionToken(sessionValue, 'subagent')

  if (!session) {
    redirect('/subagent/login')
  }

  return (
    <SubagentSidebar
      session={{
        id: session.id,
        name: session.name,
        code: session.code || '',
        commission: session.commission || 0,
        whiteLabelEnabled: session.whiteLabelEnabled || false,
      }}
    >
      {children}
    </SubagentSidebar>
  )
}
