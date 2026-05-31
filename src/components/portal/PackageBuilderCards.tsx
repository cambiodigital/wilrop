'use client'

import { formatCurrency } from '@/lib/currency'
import { Check, Bus, Building2, Mountain, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Selection Card (Summary in Step 4) ─────────────────────

interface SelectionCardProps {
  type: 'transport' | 'hotel' | 'excursion'
  title: string
  subtitle: string
  price: number
  meta?: string
  onModify: () => void
}

const typeConfig = {
  transport: { icon: Bus, bg: 'bg-green-100', color: 'text-green-600' },
  hotel: { icon: Building2, bg: 'bg-blue-100', color: 'text-blue-600' },
  excursion: { icon: Mountain, bg: 'bg-purple-100', color: 'text-purple-600' },
}

export function SelectionCard({ type, title, subtitle, price, meta, onModify }: SelectionCardProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`size-8 rounded-lg ${config.bg} flex items-center justify-center`}>
          <Icon className={`size-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-800 truncate">{title}</p>
          <p className="text-xs text-neutral-500 truncate">{subtitle}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-amber-600">{formatCurrency(price)}</p>
          {meta && <p className="text-[11px] text-neutral-400">{meta}</p>}
        </div>
      </div>
      <button onClick={onModify} className="text-xs text-amber-600 hover:underline">
        Modificar
      </button>
    </div>
  )
}

// ─── Selection Preview (Inline confirmation in steps 1-3) ───

interface SelectionPreviewProps {
  label: string
}

export function SelectionPreview({ label }: SelectionPreviewProps) {
  return (
    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm">
      <span className="text-emerald-700 font-medium flex items-center gap-1.5">
        <Check className="size-4" />
        {label}
      </span>
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────────

interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
      <AlertCircle className="size-10 text-amber-400 mx-auto mb-3" />
      <p className="text-sm font-semibold text-amber-700">{title}</p>
      {description && <p className="text-xs text-amber-600 mt-1">{description}</p>}
      {action && (
        <Button variant="outline" className="mt-3 rounded-xl" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// ─── Error Banner ───────────────────────────────────────────

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
      <AlertCircle className="size-5 text-red-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-red-700">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0 rounded-lg">
          <RefreshCw className="size-3.5 mr-1" />
          Reintentar
        </Button>
      )}
    </div>
  )
}

// ─── Loading Skeleton for Step Content ──────────────────────

export function StepLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}
