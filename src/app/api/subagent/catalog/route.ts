import { NextRequest, NextResponse } from 'next/server'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('subagent'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'subagent')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const sourceType = url.searchParams.get('sourceType')
    const search = url.searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (sourceType) {
      where.sourceType = sourceType
    }

    if (search) {
      where.OR = [
        { customName: { contains: search, mode: 'insensitive' } },
        { customDescription: { contains: search, mode: 'insensitive' } },
      ]
    }

    const catalogItems = await db.resellerCatalog.findMany({
      where: {
        active: true,
        ...where,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        resellerId: true,
        sourceType: true,
        sourceId: true,
        customPrice: true,
        customName: true,
        customDescription: true,
        active: true,
        featured: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: catalogItems })
  } catch (error) {
    console.error('[SubagentCatalog GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo cargar el catálogo' },
      { status: 500 },
    )
  }
}
