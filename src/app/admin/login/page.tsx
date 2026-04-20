import AdminLogin from '@/components/admin/AdminLogin'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_COOKIE, decodeAdminSession } from '@/lib/admin-auth'

export default async function AdminLoginPage() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  const session = decodeAdminSession(sessionValue)

  if (session) {
    redirect('/admin')
  }

  return <AdminLogin />
}