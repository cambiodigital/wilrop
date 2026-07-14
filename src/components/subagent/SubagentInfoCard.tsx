'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, MapPin } from 'lucide-react'
import type { SubagentProfileData } from '@/lib/subagent/profile'

const statusConfig: Record<string, { className: string; label: string }> = {
  pending: { className: 'bg-amber-100 text-amber-700 hover:bg-amber-100', label: 'Pendiente' },
  approved: { className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100', label: 'Aprobado' },
  rejected: { className: 'bg-red-100 text-red-700 hover:bg-red-100', label: 'Rechazado' },
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function SubagentInfoCard({ profile }: { profile: SubagentProfileData }) {
  const status = statusConfig[profile.approvalStatus]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="w-20 h-20 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {getInitials(profile.agencyName || profile.contactName || 'SA')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-semibold text-card-foreground">
              {profile.agencyName || 'Sin agencia'}
            </h2>
            <p className="text-sm text-muted-foreground">{profile.contactName}</p>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{profile.email}</span>
              {profile.country && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.country}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Código: {profile.code}</Badge>
              {status && <Badge className={status.className}>{status.label}</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
