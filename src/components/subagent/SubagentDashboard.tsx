'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  FileText,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNavigationStore } from '@/store/useNavigationStore'
import { formatCOP } from '@/data/packages'

interface SubagentDashboardSession {
  id: string
  name: string
  code: string
  commission: number
}

// ─── Types ──────────────────────────────────────────────────
interface BookingItem {
  id: string
  itemType: string
  serviceId: string
  serviceName: string
  roomName: string
  dateFrom: string
  dateTo: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: string
  addons: any[]
}

interface Booking {
  id: string
  code: string
  subagentId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  adults: number
  children: number
  status: string
  totalPrice: number
  netPrice: number
  commissionAmt: number
  checkIn: string
  checkOut: string
  bookedBy: string
  createdAt: string
  items: BookingItem[]
  subagent: {
    id: string
    code: string
    agencyName: string
    contactName: string
    email: string
    commission: number
  } | null
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-100' },
  confirmed: { label: 'Confirmada', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  completed: { label: 'Completada', color: 'text-blue-700', bg: 'bg-blue-100' },
  cancelled: { label: 'Cancelada', color: 'text-red-700', bg: 'bg-red-100' },
}

const itemTypeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  hotel: { icon: <FileText className="size-3.5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
  transport: { icon: <TrendingUp className="size-3.5" />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  excursion: { icon: <ShoppingCart className="size-3.5" />, color: 'text-purple-600', bg: 'bg-purple-100' },
}

// ─── Animation ──────────────────────────────────────────────
const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

// ─── Main Component ─────────────────────────────────────────
export default function SubagentDashboard({ session }: { session?: SubagentDashboardSession }) {
  const { subagentId, subagentName, subagentCode, subagentCommission } = useNavigationStore()
  const currentSession = {
    id: session?.id || subagentId,
    name: session?.name || subagentName,
    code: session?.code || subagentCode,
    commission: session?.commission || subagentCommission,
  }

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentSession.id) return
      setLoading(true)
      try {
        const res = await fetch('/api/subagent/bookings')
        const json = await res.json()
        if (json.success) {
          setBookings(json.data)
        }
      } catch (err) {
        console.error('Error fetching bookings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [currentSession.id])

  // Stats
  const stats = useMemo(() => {
    const total = bookings.length
    const pending = bookings.filter((b) => b.status === 'pending').length
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0)
    const totalCommission = bookings.reduce((sum, b) => sum + b.commissionAmt, 0)
    return { total, pending, confirmed, totalRevenue, totalCommission }
  }, [bookings])

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings
    return bookings.filter((b) => b.status === statusFilter)
  }, [bookings, statusFilter])

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div {...fadeIn}>
        <h1 className="text-2xl font-bold text-neutral-900">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Bienvenido, <span className="font-medium text-amber-600">{currentSession.name}</span> · Código: <span className="font-mono text-amber-600">{currentSession.code}</span> · Comisión: <span className="font-medium">{currentSession.commission}%</span>
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.05 }}>
          <Card className="border-neutral-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Total Reservas</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.total}</p>
                </div>
                <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="size-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <Card className="border-neutral-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Pendientes</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                </div>
                <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="size-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
          <Card className="border-neutral-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCOP(stats.totalRevenue)}</p>
                </div>
                <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="size-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <Card className="border-neutral-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Comisiones Ganadas</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{formatCOP(stats.totalCommission)}</p>
                </div>
                <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="size-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bookings Table */}
      <motion.div {...fadeIn} transition={{ delay: 0.25 }}>
        <Card className="border-neutral-200">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Mis Ventas</h2>
                <p className="text-xs text-neutral-500">{filteredBookings.length} reservas encontradas</p>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 rounded-xl text-sm">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <ShoppingCart className="size-10 text-neutral-300 mb-3" />
                  <p className="text-sm font-semibold text-neutral-600">No hay reservas</p>
                  <p className="text-xs text-neutral-400 mt-1">Las reservas que realices aparecerán aquí</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-y border-neutral-200 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Código</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Pasajero</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Pax</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Estado</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Comisión</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredBookings.map((booking) => {
                      const st = statusConfig[booking.status] || statusConfig.pending
                      return (
                        <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-amber-600 font-semibold text-xs">{booking.code}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <div>
                              <p className="font-medium text-neutral-800 text-sm">{booking.guestName}</p>
                              <p className="text-[11px] text-neutral-400">{booking.guestEmail}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-neutral-600">{booking.adults}{booking.children > 0 ? `+${booking.children}` : ''}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`${st.bg} ${st.color} border-transparent text-xs rounded-full`}>
                              {st.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold text-neutral-900">{formatCOP(booking.totalPrice)}</span>
                          </td>
                          <td className="px-4 py-3 text-right hidden lg:table-cell">
                            <span className="font-medium text-amber-600">{formatCOP(booking.commissionAmt)}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-neutral-500 text-xs flex items-center gap-1">
                              <Calendar className="size-3" />
                              {new Date(booking.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
