import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { z } from 'zod'

const articleSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  category: z.string().max(100).default('general'),
  content: z.string().default(''),
  imageLabels: z.string().default('[]'),
  published: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
})

async function requireAdminSession() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(getPanelSessionCookieName('admin'))?.value
  return verifyPanelSessionToken(sessionValue, 'admin')
}

export async function GET() {
  try {
    const session = await requireAdminSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 },
      )
    }

    const articles = await db.helpArticle.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ success: true, data: articles })
  } catch (error) {
    console.error('[HelpArticles GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los artículos' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const result = articleSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: result.error.issues },
        { status: 400 },
      )
    }

    const existing = await db.helpArticle.findUnique({
      where: { slug: result.data.slug },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un artículo con ese slug' },
        { status: 409 },
      )
    }

    const article = await db.helpArticle.create({ data: result.data })
    return NextResponse.json({ success: true, data: article }, { status: 201 })
  } catch (error) {
    console.error('[HelpArticles POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo crear el artículo' },
      { status: 500 },
    )
  }
}
