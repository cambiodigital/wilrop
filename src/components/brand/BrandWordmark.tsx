import Image from 'next/image'
import { brand } from '@/lib/brand'
import { cn } from '@/lib/utils'

interface BrandWordmarkProps {
  inverted?: boolean
  compact?: boolean
  className?: string
}

export function BrandWordmark({ inverted = false, compact = false, className }: BrandWordmarkProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src={brand.iconPath}
        alt=""
        width={32}
        height={32}
        className={cn('size-8', inverted && 'invert')}
        priority
      />
      <div>
        <span className={cn('block font-bold leading-none tracking-tight', compact ? 'text-sm' : 'text-lg', inverted ? 'text-white' : 'text-neutral-900')}>
          {brand.shortName}
        </span>
        {!compact && (
          <span className={cn('mt-0.5 block text-xs leading-none', inverted ? 'text-white/75' : 'text-neutral-500')}>
            Group Travel
          </span>
        )}
      </div>
    </div>
  )
}
