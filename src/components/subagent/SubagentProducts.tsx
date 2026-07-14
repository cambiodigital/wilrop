'use client'
import { formatCurrency } from '@/lib/currency'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bed, Bus, Mountain, Search, Ship } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductGrid } from './ProductGrid'
import { ProductStats } from './ProductStats'

interface CatalogItem {
  id: string
  sourceType: string
  sourceId: string
  customPrice: number | null
  customName: string | null
  customDescription: string | null
  active: boolean
  featured: boolean
}

const productTabs = [
  { value: 'hotels', label: 'Hoteles', icon: Bed },
  { value: 'excursions', label: 'Excursiones', icon: Mountain },
  { value: 'transport', label: 'Transporte', icon: Bus },
  { value: 'cruises', label: 'Cruceros', icon: Ship },
]

function includesSearch(values: string[], search: string) {
  const normalized = search.trim().toLowerCase()
  if (!normalized) return true
  return values.some((v) => v.toLowerCase().includes(normalized))
}

export default function SubagentProducts() {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchCatalog() {
      setLoading(true)
      try {
        const res = await fetch('/api/subagent/catalog')
        const json = await res.json()
        if (json.success) setItems(json.data)
      } finally {
        setLoading(false)
      }
    }
    fetchCatalog()
  }, [])

  const byType = (type: string) => items.filter((i) => i.sourceType === type)
  const hotels = useMemo(() => byType('hotel'), [items])
  const excursions = useMemo(() => byType('excursion'), [items])
  const transport = useMemo(() => byType('transport'), [items])
  const cruises = useMemo(() => byType('cruise'), [items])

  const filteredHotels = useMemo(() => hotels.filter((i) => includesSearch([i.customName || ''], search)), [hotels, search])
  const filteredExcursions = useMemo(() => excursions.filter((i) => includesSearch([i.customName || ''], search)), [excursions, search])
  const filteredTransport = useMemo(() => transport.filter((i) => includesSearch([i.customName || ''], search)), [transport, search])
  const filteredCruises = useMemo(() => cruises.filter((i) => includesSearch([i.customName || ''], search)), [cruises, search])

  const tabData = [
    { value: 'hotels', items: filteredHotels, icon: Bed },
    { value: 'excursions', items: filteredExcursions, icon: Mountain },
    { value: 'transport', items: filteredTransport, icon: Bus },
    { value: 'cruises', items: filteredCruises, icon: Ship },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">Productos Disponibles</h1>
        <p className="mt-1 text-sm text-muted-foreground">Productos activos disponibles en el catálogo para revender.</p>
      </div>

      <ProductStats hotels={hotels.length} excursions={excursions.length} transport={transport.length} cruises={cruises.length} />

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por producto o ciudad" className="pl-10" />
      </div>

      <Tabs defaultValue="hotels">
        <TabsList className="bg-brand-section text-brand-text">
          {productTabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2 data-[state=active]:bg-brand-surface data-[state=active]:text-brand-text [&[data-state=active]]:font-semibold">
              <Icon className="size-4" />{label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabData.map(({ value, items: typeItems, icon: Icon }) => (
          <TabsContent key={value} value={value} className="mt-5">
            <ProductGrid loading={loading} empty={!typeItems.length}>
              {typeItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="size-9 rounded-lg bg-primary/10 p-2 text-primary" />
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-card-foreground truncate">{item.customName || `Producto #${item.sourceId.slice(0, 8)}`}</h2>
                        {item.customDescription && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.customDescription}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.featured && <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-xs">Destacado</Badge>}
                      {item.customPrice != null && <span className="text-sm font-semibold text-card-foreground">{formatCurrency(item.customPrice)}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ProductGrid>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  )
}
