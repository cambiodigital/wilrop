'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdminEntityDialog } from '@/components/admin/AdminEntityDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface HelpArticle {
  id: string
  slug: string
  title: string
  category: string
  content: string
  imageLabels: string
  published: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'bookings', label: 'Gestión de Reservas' },
  { value: 'whitelabel', label: 'Configuración Whitelabel' },
  { value: 'catalog', label: 'Catálogo de Productos' },
  { value: 'commissions', label: 'Comisiones y Pagos' },
  { value: 'clients', label: 'Gestión de Clientes' },
]

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const emptyArticle = {
  title: '',
  slug: '',
  category: 'general',
  content: '',
  imageLabels: '[]',
  published: true,
  sortOrder: 0,
}

export default function AdminDocumentation() {
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyArticle)

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/help-articles')
      const data = await res.json()
      if (data.success) setArticles(data.data)
    } catch {
      toast.error('Error al cargar artículos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyArticle)
    setDialogOpen(true)
  }

  const openEdit = (article: HelpArticle) => {
    setEditingId(article.id)
    setForm({
      title: article.title,
      slug: article.slug,
      category: article.category,
      content: article.content,
      imageLabels: article.imageLabels,
      published: article.published,
      sortOrder: article.sortOrder,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('El título es obligatorio')
      return
    }

    const slug = form.slug || generateSlug(form.title)

    try {
      setSaving(true)
      const url = editingId
        ? `/api/admin/help-articles/${editingId}`
        : '/api/admin/help-articles'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingId ? 'Artículo actualizado' : 'Artículo creado')
        setDialogOpen(false)
        fetchArticles()
      } else {
        toast.error(data.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/admin/help-articles/${deletingId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Artículo eliminado')
        setDeleteDialogOpen(false)
        setDeletingId(null)
        fetchArticles()
      } else {
        toast.error(data.error || 'Error al eliminar')
      }
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const getCategoryLabel = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat)?.label ?? cat

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentación</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestiona los artículos de ayuda para revendedores y subagentes.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Artículo
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Artículos de Ayuda</CardTitle>
          <CardDescription>
            {articles.length} artículo{articles.length !== 1 ? 's' : ''} en total
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">
                No hay artículos creados aún.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getCategoryLabel(article.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {article.published ? (
                        <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                          <Eye className="w-3 h-3" /> Publicado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <EyeOff className="w-3 h-3" /> Borrador
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {article.sortOrder}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(article)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeletingId(article.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <AdminEntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingId ? 'Editar artículo' : 'Nuevo artículo'}
        description={
          <>
            Completá los campos. El contenido soporta Markdown. Usá{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              [Captura: Descripción]
            </code>{' '}
            para indicar placeholders de imagen.
          </>
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  setForm((f) => ({
                    ...f,
                    title,
                    slug: f.slug || generateSlug(title),
                  }))
                }}
                placeholder="Cómo gestionar reservas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                placeholder="como-gestionar-reservas"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, category: value }))
                }
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Seleccioná una categoría" />
                </SelectTrigger>
                  <SelectContent className="admin-dialog">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Orden</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sortOrder: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenido (Markdown)</Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              placeholder="# Título del artículo&#10;&#10;Escribe aquí el contenido...&#10;&#10;[Captura: Pantalla de configuración]"
              className="min-h-[240px] font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="published"
              checked={form.published}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, published: checked }))
              }
            />
            <Label htmlFor="published" className="cursor-pointer">
              Publicado
            </Label>
          </div>
        </div>
      </AdminEntityDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar artículo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El artículo será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
