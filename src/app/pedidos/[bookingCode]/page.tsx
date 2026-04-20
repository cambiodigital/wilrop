import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CheckCircle2, CreditCard, Hotel, MapPin, Plane, ReceiptText, User } from 'lucide-react'
import PortalShell from '@/components/portal/PortalShell'
import PortalBreadcrumbs from '@/components/portal/PortalBreadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { db } from '@/lib/db'
import { buildPublicMetadata } from '@/lib/seo'

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function itemIcon(itemType: string) {
  switch (itemType) {
    case 'hotel':
      return <Hotel className="size-4 text-amber-500" />
    case 'transport':
      return <Plane className="size-4 text-amber-500" />
    default:
      return <MapPin className="size-4 text-amber-500" />
  }
}

interface OrderDetailRouteProps {
  params: Promise<{
    bookingCode: string
  }>
}

export async function generateMetadata({ params }: OrderDetailRouteProps): Promise<Metadata> {
  const { bookingCode } = await params

  return buildPublicMetadata({
    title: `Pedido ${bookingCode} | WILROP`,
    description: `Detalle del pedido ${bookingCode} generado en WILROP Colombia Travel.`,
    path: `/pedidos/${bookingCode}`,
    noIndex: true,
  })
}

export default async function OrderDetailRoutePage({ params }: OrderDetailRouteProps) {
  const { bookingCode } = await params

  const booking = await db.booking.findUnique({
    where: { code: bookingCode },
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
      },
      subagent: {
        select: {
          code: true,
          agencyName: true,
        },
      },
    },
  })

  if (!booking) {
    notFound()
  }

  const childrenAges = safeJsonParse<number[]>(booking.childrenAges, [])
  const bookingItems = booking.items.map((item) => ({
    ...item,
    addons: safeJsonParse<Array<{ type?: string; price?: number }>>(item.addons, []),
  }))

  return (
    <PortalShell>
      <div className="min-h-screen bg-neutral-50 px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <PortalBreadcrumbs
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Pedidos' },
              { label: booking.code },
            ]}
          />

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="size-4" />
                  Pedido registrado
                </div>
                <h1 className="mt-4 text-3xl font-bold text-neutral-900">Pedido {booking.code}</h1>
                <p className="mt-2 max-w-2xl text-sm text-neutral-500">
                  Esta URL resume la reserva creada. Puedes compartirla o revisarla más tarde para ver los datos principales del pedido.
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
                <p className="font-semibold">Estado actual</p>
                <p className="mt-1 capitalize">{booking.status}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Card className="border-neutral-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ReceiptText className="size-5 text-amber-500" />
                  Servicios reservados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookingItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-neutral-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {itemIcon(item.itemType)}
                          <h2 className="font-semibold text-neutral-900">{item.serviceName || item.serviceId}</h2>
                          <Badge variant="secondary" className="capitalize">
                            {item.itemType}
                          </Badge>
                        </div>
                        {item.roomName ? (
                          <p className="text-sm text-neutral-500">Habitación: {item.roomName}</p>
                        ) : null}
                        {item.dateFrom ? (
                          <p className="text-sm text-neutral-500">
                            Fecha: {item.dateFrom}{item.dateTo ? ` → ${item.dateTo}` : ''}
                          </p>
                        ) : null}
                        <p className="text-sm text-neutral-500">
                          Cantidad: {item.quantity} · Precio unitario: ${item.unitPrice.toLocaleString('es-CO')}
                        </p>
                        {item.addons.length > 0 ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.addons.map((addon, index) => (
                              <Badge key={`${item.id}-addon-${index}`} variant="outline">
                                {addon.type || 'extra'}{typeof addon.price === 'number' ? ` · $${addon.price.toLocaleString('es-CO')}` : ''}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-500">Subtotal</p>
                        <p className="text-lg font-bold text-neutral-900">${item.totalPrice.toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-neutral-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="size-5 text-amber-500" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-neutral-600">
                  <div>
                    <p className="text-neutral-500">Nombre</p>
                    <p className="font-medium text-neutral-900">{booking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Correo</p>
                    <p className="font-medium text-neutral-900">{booking.guestEmail}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Teléfono</p>
                    <p className="font-medium text-neutral-900">{booking.guestPhone}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-neutral-500">Pasajeros</p>
                    <p className="font-medium text-neutral-900">
                      {booking.adults} adulto{booking.adults !== 1 ? 's' : ''}
                      {booking.children > 0 ? `, ${booking.children} niño${booking.children !== 1 ? 's' : ''}` : ''}
                    </p>
                    {childrenAges.length > 0 ? (
                      <p className="mt-1 text-xs text-neutral-500">Edades niños: {childrenAges.join(', ')}</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="size-5 text-amber-500" />
                    Resumen económico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-neutral-600">
                  <div className="flex items-center justify-between">
                    <span>Total pedido</span>
                    <span className="font-semibold text-neutral-900">${booking.totalPrice.toLocaleString('es-CO')}</span>
                  </div>
                  {booking.netPrice > 0 ? (
                    <div className="flex items-center justify-between">
                      <span>Neto</span>
                      <span className="font-semibold text-neutral-900">${booking.netPrice.toLocaleString('es-CO')}</span>
                    </div>
                  ) : null}
                  {booking.commissionAmt > 0 ? (
                    <div className="flex items-center justify-between">
                      <span>Comisión</span>
                      <span className="font-semibold text-neutral-900">${booking.commissionAmt.toLocaleString('es-CO')}</span>
                    </div>
                  ) : null}
                  <Separator />
                  <div>
                    <p className="text-neutral-500">Canal</p>
                    <p className="font-medium capitalize text-neutral-900">{booking.bookedBy}</p>
                  </div>
                  {booking.subagent ? (
                    <div>
                      <p className="text-neutral-500">Subagente</p>
                      <p className="font-medium text-neutral-900">{booking.subagent.agencyName} ({booking.subagent.code})</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  )
}