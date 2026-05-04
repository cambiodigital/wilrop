'use client'

import type { ReactNode } from 'react'
import PortalHeader from '@/components/portal/PortalHeader'
import PortalFooter from '@/components/portal/PortalFooter'
import MarketingModalPopup from '@/components/portal/MarketingModalPopup'

interface PortalShellProps {
  children: ReactNode
}

export default function PortalShell({ children }: PortalShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">{children}</main>
      <PortalFooter />
      <MarketingModalPopup />
    </div>
  )
}
