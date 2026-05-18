'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlySaleData } from '@/lib/reseller/dashboard';

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-sm font-semibold text-amber-600">{formatCOP(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export function ResellerSalesChart({ data, loading }: { data?: MonthlySaleData[]; loading?: boolean }) {
  if (loading || !data) {
    return <Skeleton className="h-80 rounded-lg" />;
  }

  if (!data.length || data.every((d) => d.ventas === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Ventas Mensuales</CardTitle>
          <p className="text-xs text-gray-500 -mt-2">Últimos 6 meses</p>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-56 text-sm text-gray-400">
          No hay ventas registradas en los últimos 6 meses.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Ventas Mensuales</CardTitle>
        <p className="text-xs text-gray-500 -mt-2">Últimos 6 meses</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-gold)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--brand-gold)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="ventas"
                stroke="var(--brand-gold)"
                strokeWidth={2.5}
                fill="url(#colorVentas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
