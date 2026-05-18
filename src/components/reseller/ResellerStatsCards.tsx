'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, DollarSign, Users, Package, AlertCircle } from 'lucide-react';
import { DashboardStats } from '@/lib/reseller/dashboard';

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const cardsConfig = [
  {
    title: 'Ventas del Mes',
    key: 'monthlySales' as const,
    format: 'currency' as const,
    icon: <TrendingUp className="w-5 h-5" />,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Comisiones Ganadas',
    key: 'monthlyCommission' as const,
    format: 'currency' as const,
    icon: <DollarSign className="w-5 h-5" />,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Clientes Activos',
    key: 'activeClients' as const,
    format: 'number' as const,
    icon: <Users className="w-5 h-5" />,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Productos en Catálogo',
    key: 'catalogItems' as const,
    format: 'number' as const,
    icon: <Package className="w-5 h-5" />,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

function formatValue(value: number, format: 'currency' | 'number'): string {
  if (format === 'currency') return formatCOP(value);
  return value.toLocaleString('es-CO');
}

export function ResellerStatsCards({ stats, loading }: { stats?: DashboardStats; loading?: boolean }) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardsConfig.map(({ title, key, format, icon, iconBg, iconColor }) => (
        <Card key={key} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatValue(stats[key], format)}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${iconBg}`}>
                <span className={iconColor}>{icon}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {stats.pendingBookings > 0 && (
        <Card className="sm:col-span-2 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-100">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">
                  {stats.pendingBookings} {stats.pendingBookings === 1 ? 'venta pendiente' : 'ventas pendientes'}{' '}
                  de confirmación
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
