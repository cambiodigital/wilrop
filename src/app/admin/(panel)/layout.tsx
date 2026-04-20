import type { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_COOKIE, decodeAdminSession } from '@/lib/admin-auth'

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  const session = decodeAdminSession(sessionValue)

  if (!session) {
    redirect('/admin/login')
  }

  return <AdminSidebar adminName={session.name}>{children}</AdminSidebar>
}