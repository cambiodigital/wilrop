import Image from 'next/image'
import { brand } from '@/lib/brand'
import { cn } from '@/lib/utils'

interface BrandWordmarkProps {
  inverted?: boolean
  compact?: boolean
  className?: string
}

export function BrandWordmark({ inverted = false, compact = false, className }: BrandWordmarkProps) {
  const src = compact
    ? inverted
      ? brand.assets.iconDark
      : brand.assets.iconLight
    : inverted
      ? brand.assets.logoDark
      : brand.assets.logoLight

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src={src}
        alt={brand.name}
        width={compact ? 562 : 1064}
        height={compact ? 516 : 272}
        className={cn(compact ? 'size-8 object-contain' : 'h-9 w-auto object-contain')}
        priority
      />
    </div>
  )
}
