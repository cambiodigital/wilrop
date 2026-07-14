'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProductGrid({
  children,
  loading,
  empty,
}: {
  children: React.ReactNode
  loading: boolean
  empty: boolean
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    )
  }

  if (empty) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        No hay productos disponibles en esta categoría.
      </div>
    )
  }

  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
}
