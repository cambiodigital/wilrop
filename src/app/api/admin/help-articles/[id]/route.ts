import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  category: z.string().max(100).optional(),
  content: z.string().optional(),
  imageLabels: z.string().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

async function requireAdminSession() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(getPanelSessionCookieName('admin'))?.value
  return verifyPanelSessionToken(sessionValue, 'admin')
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 },
      )
    }

    const { id } = await params
    const article = await db.helpArticle.findUnique({ where: { id } })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Artículo no encontrado' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data: article })
  } catch (error) {
    console.error('[HelpArticle GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 },
      )
    }

    const { id } = await params
    const body = await request.json()
    const result = updateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: result.error.issues },
        { status: 400 },
      )
    }

    const existing = await db.helpArticle.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Artículo no encontrado' },
        { status: 404 },
      )
    }

    if (result.data.slug && result.data.slug !== existing.slug) {
      const slugConflict = await db.helpArticle.findUnique({
        where: { slug: result.data.slug },
      })
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un artículo con ese slug' },
          { status: 409 },
        )
      }
    }

    const article = await db.helpArticle.update({
      where: { id },
      data: result.data,
    })

    return NextResponse.json({ success: true, data: article })
  } catch (error) {
    console.error('[HelpArticle PATCH] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 },
      )
    }

    const { id } = await params
    const existing = await db.helpArticle.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Artículo no encontrado' },
        { status: 404 },
      )
    }

    await db.helpArticle.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Artículo eliminado' })
  } catch (error) {
    console.error('[HelpArticle DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno' },
      { status: 500 },
    )
  }
}
