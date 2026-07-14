'use client'

import { Bed, Bus, Mountain, Ship } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsProps {
  hotels: number
  excursions: number
  transport: number
  cruises: number
}

const stats = [
  { key: 'hotels', label: 'hoteles', icon: Bed, color: 'blue' },
  { key: 'excursions', label: 'excursiones', icon: Mountain, color: 'emerald' },
  { key: 'transport', label: 'traslados', icon: Bus, color: 'amber' },
  { key: 'cruises', label: 'cruceros', icon: Ship, color: 'indigo' },
] as const

export function ProductStats({ hotels, excursions, transport, cruises }: StatsProps) {
  const counts = { hotels, excursions, transport, cruises }

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {stats.map(({ key, label, icon: Icon, color }) => (
        <Card key={key}>
          <CardContent className="flex items-center gap-3 p-4">
            <Icon className={`size-8 rounded-lg bg-${color}-100 p-1.5 text-${color}-700`} />
            <div>
              <p className="text-xl font-bold">{counts[key]}</p>
              <p className="text-xs text-muted-foreground">{label} activos</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
