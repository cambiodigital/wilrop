'use client'
import { formatDateShort } from '@/lib/date'
import { formatCurrency } from '@/lib/currency'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Eye,
  Package,
  Bus,
  Building2,
  Mountain,
  Users,
  Calendar,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ─────────────────────────────────────────────────

interface BookingItem {
  id: string
  bookingId: string
  itemType: string
  serviceId: string
  serviceName: string
  roomTypeId: string
  roomName: string
  dateFrom: string
  dateTo: string
  quantity: number
  unitPrice: number
  totalPrice: number
  addons: any[]
  status: string
}

interface CustomPackageBooking {
  id: string
  code: string
  guestName: string
  guestEmail: string
  guestPhone: string
  guestCountry: string
  adults: number
  children: number
  notes: string
  status: string
  totalPrice: number
  netPrice: number
  commissionAmt: number
  checkIn: string
  checkOut: string
  bookedBy: string
  createdAt: string
  items: BookingItem[]
  reseller?: {
    id: string
    companyName: string
    contactName: string
    email: string
    commission: number
  } | null
}

// ─── Item Type Config ──────────────────────────────────────

const itemTypeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  hotel: { label: 'Hotel', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
  transport: { label: 'Transporte', icon: Bus, color: 'text-green-600', bg: 'bg-green-100' },
  excursion: { label: 'Excursión', icon: Mountain, color: 'text-purple-600', bg: 'bg-purple-100' },
  package: { label: 'Paquete', icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
  cruise: { label: 'Crucero', icon: Package, color: 'text-cyan-600', bg: 'bg-cyan-100' },
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-100' },
  confirmed: { label: 'Confirmada', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  cancelled: { label: 'Cancelada', color: 'text-red-700', bg: 'bg-red-100' },
  completed: { label: 'Completada', color: 'text-blue-700', bg: 'bg-blue-100' },
}

// ─── Component ─────────────────────────────────────────────

export default function AdminCustomPackages() {
  const [bookings, setBookings] = useState<CustomPackageBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<CustomPackageBooking | null>(null)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    withReseller: 0,
  })

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ bookedBy: 'custom-package' })
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/bookings?${params.toString()}`)
      if (!res.ok) throw new Error('Error al cargar paquetes personalizados')
      const json = await res.json()
      const data = json.data || json || []
      setBookings(data)

      // Calculate stats
      const total = data.length
      const totalRevenue = data.reduce((sum: number, b: CustomPackageBooking) => sum + b.totalPrice, 0)
      const avgOrderValue = total > 0 ? Math.round(totalRevenue / total) : 0
      const withReseller = data.filter((b: CustomPackageBooking) => b.reseller).length

      setStats({ total, totalRevenue, avgOrderValue, withReseller })
    } catch (err) {
      console.error(err)
      toast.error('Error al cargar paquetes personalizados')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const filtered = bookings.filter((b) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      b.code.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q) ||
      b.guestEmail.toLowerCase().includes(q) ||
      b.reseller?.companyName?.toLowerCase().includes(q) ||
      b.reseller?.contactName?.toLowerCase().includes(q)
    )
  })

  const openDetail = (booking: CustomPackageBooking) => {
    setSelectedBooking(booking)
    setDetailOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Paquetes Personalizados
          </h1>
          <p className="mt-1">
            Paquetes armados por usuarios y revendedores via /paquetes/armar
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Paquetes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Calendar className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Valor Promedio</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Via Revendedor</p>
                <p className="text-2xl font-bold">{stats.withReseller}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, cliente o revendedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Revendedor</TableHead>
                    <TableHead>Servicios</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {search ? 'No se encontraron resultados' : 'No hay paquetes personalizados aún'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-sm font-medium">{booking.code}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{booking.guestName}</p>
                            <p className="text-xs text-muted-foreground">{booking.guestEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.reseller ? (
                            <div>
                              <p className="text-sm font-medium">{booking.reseller.companyName || booking.reseller.contactName}</p>
                              <p className="text-xs text-muted-foreground">{booking.reseller.commission}% comisión</p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Directo (B2C)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {booking.items.map((item, idx) => {
                              const config = itemTypeConfig[item.itemType] || itemTypeConfig.package
                              const Icon = config.icon
                              return (
                                <div
                                  key={idx}
                                  className={`size-7 rounded-md ${config.bg} flex items-center justify-center`}
                                  title={`${config.label}: ${item.serviceName}`}
                                >
                                  <Icon className={`size-3.5 ${config.color}`} />
                                </div>
                              )
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold">{formatCurrency(booking.totalPrice)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig[booking.status]?.bg || 'bg-neutral-100'} ${statusConfig[booking.status]?.color || 'text-neutral-600'} border-transparent text-xs`}>
                            {statusConfig[booking.status]?.label || booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDateShort(booking.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => openDetail(booking)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto admin-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="size-5 text-primary" />
              Paquete {selectedBooking?.code}
            </DialogTitle>
            <DialogDescription>
              Detalle del paquete personalizado armado via /paquetes/armar
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-5 pt-2">
              {/* Guest Info */}
              <div>
                <div className="form-section-title">Datos del Pasajero</div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Nombre</p>
                    <p className="text-sm font-medium">{selectedBooking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{selectedBooking.guestEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="text-sm font-medium">{selectedBooking.guestPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estado</p>
                    <Badge className={`${statusConfig[selectedBooking.status]?.bg} ${statusConfig[selectedBooking.status]?.color} border-transparent text-xs`}>
                      {statusConfig[selectedBooking.status]?.label || selectedBooking.status}
                    </Badge>
                  </div>
                </div>
                {selectedBooking.notes && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">Notas</p>
                    <p className="text-sm">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              {/* Reseller Info */}
              {selectedBooking.reseller && (
                <div>
                  <div className="form-section-title">Revendedor</div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Empresa</p>
                      <p className="text-sm font-medium">{selectedBooking.reseller.companyName || selectedBooking.reseller.contactName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Comisión</p>
                      <p className="text-sm font-medium">{selectedBooking.reseller.commission}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <div className="form-section-title">Servicios Seleccionados</div>
                <div className="space-y-3 mt-2">
                  {selectedBooking.items.map((item) => {
                    const config = itemTypeConfig[item.itemType] || itemTypeConfig.package
                    const Icon = config.icon
                    return (
                      <div key={item.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                            <Icon className={`size-4 ${config.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{item.serviceName}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span>{config.label}</span>
                              {item.dateFrom && <span>{item.dateFrom}{item.dateTo ? ` → ${item.dateTo}` : ''}</span>}
                              {item.roomName && <span>Hab: {item.roomName}</span>}
                              <span>×{item.quantity}</span>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-primary">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total del Paquete</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(selectedBooking.totalPrice)}</span>
                </div>
                {selectedBooking.commissionAmt > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Comisión revendedor</span>
                    <span className="text-sm font-medium text-amber-600">{formatCurrency(selectedBooking.commissionAmt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
