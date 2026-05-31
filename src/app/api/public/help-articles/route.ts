import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'

async function requireHelpViewerSession() {
  const cookieStore = await cookies()

  const resellerSession = verifyPanelSessionToken(
    cookieStore.get(getPanelSessionCookieName('reseller'))?.value,
    'reseller',
  )
  if (resellerSession) return resellerSession

  return verifyPanelSessionToken(
    cookieStore.get(getPanelSessionCookieName('subagent'))?.value,
    'subagent',
  )
}

export async function GET() {
  try {
    const session = await requireHelpViewerSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 },
      )
    }

    const articles = await db.helpArticle.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        content: true,
        imageLabels: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return NextResponse.json({ success: true, data: articles })
  } catch (error) {
    console.error('[PublicHelpArticles] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los artículos' },
      { status: 500 },
    )
  }
}
