'use client'

import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface AdminEntityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer: ReactNode
  className?: string
  bodyClassName?: string
}

export function AdminEntityDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  bodyClassName,
}: AdminEntityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        topAligned
        className={cn(
          'admin-dialog flex max-h-[90vh] flex-col overflow-hidden sm:max-w-2xl',
          className,
        )}
      >
        <DialogHeader className="shrink-0 border-b border-border pb-4 pr-8">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className={cn('min-h-0 flex-1 overflow-y-auto py-5', bodyClassName)}>
          {children}
        </div>

        <DialogFooter className="dialog-footer shrink-0">{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
