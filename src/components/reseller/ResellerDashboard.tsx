'use client';
import { formatDateShort } from '@/lib/date'

import { formatCurrency } from '@/lib/currency'


import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowRight, Link2, Eye, UserPlus } from 'lucide-react';
import { ResellerStatsCards } from './ResellerStatsCards';
import { ResellerSalesChart } from './ResellerSalesChart';
import type { DashboardData, RecentSaleData, RecentPackageData } from '@/lib/reseller/dashboard';

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    confirmed: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    pending: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
  };
  return styles[status] ?? 'bg-gray-100 text-gray-600 hover:bg-gray-100';
};

const statusLabels: Record<string, string> = {
  completed: 'Completada',
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ResellerDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/reseller/dashboard');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Bienvenido de vuelta! Aquí está tu resumen.</p>
        </div>
        {data && data.stats.monthlySales > 0 && (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs px-3 py-1">
            Mes en crecimiento
          </Badge>
        )}
      </motion.div>

      {/* Stats Cards */}
      <ResellerStatsCards stats={data?.stats} loading={loading} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ResellerSalesChart data={data?.monthlySales} loading={loading} />
        </motion.div>

        {/* Pending Sales */}
        <motion.div variants={itemVariants}>
          {loading ? (
            <Skeleton className="h-80 rounded-lg" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Reservas Pendientes</CardTitle>
                <p className="text-xs text-gray-500 -mt-2">
                  {data?.stats.pendingBookings ?? 0} pendientes
                </p>
              </CardHeader>
              <CardContent>
                {data?.stats.pendingBookings === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No hay reservas pendientes.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data?.recentSales
                      .filter((s) => s.status === 'pending')
                      .slice(0, 3)
                      .map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{sale.clientName}</p>
                            <p className="text-xs text-gray-500">{formatDateShort(sale.saleDate)}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(sale.total)}</p>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Recent Packages */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Paquetes Recientes</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Últimos 5 paquetes creados</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-xs"
              onClick={() => router.push('/reseller/productos')}
            >
              Ver Todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            ) : !data?.recentPackages.length ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No hay paquetes creados aún.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-gray-500">Título</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 hidden sm:table-cell">Destino</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 hidden sm:table-cell">Categoría</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-right">Precio</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentPackages.map((pkg) => (
                    <RecentPackageRow key={pkg.id} pkg={pkg} />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Sales */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Ventas Recientes</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Últimas 5 transacciones</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-xs"
              onClick={() => router.push('/reseller/ventas')}
            >
              Ver Todas
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            ) : !data?.recentSales.length ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No hay ventas registradas aún.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-gray-500">Cliente</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 hidden sm:table-cell">Fecha</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-right">Total</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-right hidden sm:table-cell">Comisión</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentSales.map((sale) => (
                    <RecentSaleRow key={sale.id} sale={sale} />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 border-amber-200 bg-white text-gray-900 hover:bg-amber-50 hover:border-amber-300 transition-all"
                onClick={() => router.push('/reseller/ventas')}
              >
                <Link2 className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">Crear Enlace de Venta</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 border-amber-200 bg-white text-gray-900 hover:bg-amber-50 hover:border-amber-300 transition-all"
                onClick={() => router.push('/reseller/comisiones')}
              >
                <Eye className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">Ver Comisión</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 border-amber-200 bg-white text-gray-900 hover:bg-amber-50 hover:border-amber-300 transition-all"
                onClick={() => router.push('/reseller/clientes')}
              >
                <UserPlus className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">Invitar Cliente</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function RecentSaleRow({ sale }: { sale: RecentSaleData }) {
  return (
    <TableRow className="cursor-pointer hover:bg-amber-50/50">
      <TableCell className="font-medium text-sm text-gray-900">{sale.clientName}</TableCell>
      <TableCell className="text-sm text-gray-500 hidden sm:table-cell">{formatDateShort(sale.saleDate)}</TableCell>
      <TableCell className="text-sm font-medium text-gray-900 text-right">{formatCurrency(sale.total)}</TableCell>
      <TableCell className="text-sm font-medium text-emerald-600 text-right hidden sm:table-cell">
        {formatCurrency(sale.commission)}
      </TableCell>
      <TableCell className="text-center">
        <Badge className={`text-[10px] px-2 py-0.5 ${getStatusBadge(sale.status)}`}>
          {statusLabels[sale.status] ?? sale.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

function RecentPackageRow({ pkg }: { pkg: RecentPackageData }) {
  return (
    <TableRow className="cursor-pointer hover:bg-amber-50/50">
      <TableCell className="font-medium text-sm text-gray-900">{pkg.title}</TableCell>
      <TableCell className="text-sm text-gray-500 hidden sm:table-cell">{pkg.destinationName || '—'}</TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{pkg.category}</Badge>
      </TableCell>
      <TableCell className="text-sm font-medium text-gray-900 text-right">{formatCurrency(pkg.price)}</TableCell>
      <TableCell className="text-center">
        <Badge className={`text-[10px] px-2 py-0.5 ${pkg.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'}`}>
          {pkg.active ? 'Publicado' : 'Borrador'}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
