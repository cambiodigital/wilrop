import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface CrumbItem {
  label: string
  href?: string
}

interface PortalBreadcrumbsProps {
  items: CrumbItem[]
  className?: string
}

export default function PortalBreadcrumbs({ items, className }: PortalBreadcrumbsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <BreadcrumbItem key={`${item.label}-${index}`}>
              {item.href && !isLast ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
              {!isLast ? <BreadcrumbSeparator /> : null}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
