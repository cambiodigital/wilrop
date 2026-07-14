'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { BookOpen, Search, ChevronRight, ArrowLeft, Calendar, Tag } from 'lucide-react'

interface HelpArticle {
  id: string
  slug: string
  title: string
  category: string
  content: string
  imageLabels: string
  createdAt: string
  updatedAt: string
}

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  general: { label: 'General', icon: '📋' },
  bookings: { label: 'Gestión de Reservas', icon: '📅' },
  whitelabel: { label: 'Configuración Whitelabel', icon: '🎨' },
  catalog: { label: 'Catálogo de Productos', icon: '📦' },
  commissions: { label: 'Comisiones y Pagos', icon: '💰' },
  clients: { label: 'Gestión de Clientes', icon: '👥' },
}

function renderMarkdown(content: string): string {
  const escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  return escaped
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/^(?!<[hld])(.+)$/gm, '<p class="mb-3 leading-relaxed">$1</p>')
}

export default function SubagentDocumentation() {
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/public/help-articles')
      const data = await res.json()
      if (data.success) setArticles(data.data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const filtered = articles.filter((a) => {
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || a.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(articles.map((a) => a.category))].sort()

  if (selectedArticle) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" className="gap-2 mb-6 text-muted-foreground hover:text-foreground" onClick={() => setSelectedArticle(null)}>
          <ArrowLeft className="w-4 h-4" /> Volver a documentación
        </Button>
        <article>
          <div className="mb-6">
            <Badge variant="secondary" className="mb-3">{CATEGORY_META[selectedArticle.category]?.label ?? selectedArticle.category}</Badge>
            <h1 className="text-2xl font-bold tracking-tight">{selectedArticle.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(selectedArticle.updatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="prose prose-sm max-w-none text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedArticle.content) }} />
        </article>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><BookOpen className="w-6 h-6" />Documentación</h1>
        <p className="text-muted-foreground text-sm mt-1">Guías y tutoriales para gestionar tu cuenta de subagente.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar artículos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant={selectedCategory === null ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(null)}>Todos</Button>
        {categories.map((cat) => (
          <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} size="sm" className="gap-1.5" onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}>
            <span>{CATEGORY_META[cat]?.icon ?? '📄'}</span>{CATEGORY_META[cat]?.label ?? cat}
          </Button>
        ))}
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-12 w-full" /></CardContent></Card>)}</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center"><BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground text-sm">{search || selectedCategory ? 'No se encontraron artículos con esos filtros.' : 'No hay artículos disponibles aún.'}</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <Card key={article.id} role="button" tabIndex={0} className="cursor-pointer hover:shadow-md transition-shadow group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" onClick={() => setSelectedArticle(article)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedArticle(article) } }}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">{article.title}</CardTitle>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                </div>
                <Badge variant="secondary" className="text-[10px] gap-1 w-fit"><Tag className="w-2.5 h-2.5" />{CATEGORY_META[article.category]?.label ?? article.category}</Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{article.content.replace(/[#*\[\]`]/g, '').slice(0, 150)}{article.content.length > 150 ? '...' : ''}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
