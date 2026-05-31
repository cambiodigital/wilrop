'use client';
import { formatCurrency } from '@/lib/currency'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export interface CommissionEntry {
  id: string;
  saleId: string;
  clientName: string;
  destination: string;
  commissionPercent: number;
  amount: number;
  status: 'available' | 'pending' | 'withdrawn';
  saleDate: string;
}

export interface CommissionByDestination {
  name: string;
  value: number;
}

export interface MonthlyCommission {
  month: string;
  amount: number;
}

const destinationColors = [
  'var(--brand-gold)',
  'var(--brand-gold-hover)',
  'var(--brand-teal)',
  'var(--brand-surface)',
  'var(--brand-line)',
];

const statusLabels: Record<string, string> = {
  available: 'Disponible',
  pending: 'Pendiente',
  withdrawn: 'Retirado',
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Disponible: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    Pendiente: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    Retirado: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
  };
  return styles[status] || '';
};

function PieChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-700">{payload[0].payload.name}</p>
        <p className="text-sm font-semibold text-amber-600">{formatCurrency(payload[0].payload.value)}</p>
      </div>
    );
  }
  return null;
}

interface ResellerCommissionHistoryProps {
  history: CommissionEntry[];
  byDestination: CommissionByDestination[];
  monthly: MonthlyCommission[];
}

export default function ResellerCommissionHistory({
  history,
  byDestination,
  monthly,
}: ResellerCommissionHistoryProps) {
  const coloredDestinations = byDestination.map((dest, idx) => ({
    ...dest,
    color: destinationColors[idx % destinationColors.length],
  }));

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission by Destination - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Comisiones por Destino</CardTitle>
            <p className="text-xs text-gray-500 -mt-2">Distribución de ganancias</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              {coloredDestinations.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={coloredDestinations}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {coloredDestinations.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 ml-2">
                    {coloredDestinations.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-sm">Sin datos disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Commission Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Comisiones Mensuales</CardTitle>
            <p className="text-xs text-gray-500 -mt-2">Últimos 6 meses</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {monthly.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthly}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => v > 0 ? `${(v / 1000000).toFixed(1)}M` : '0'}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Comisión']}
                    />
                    <Bar dataKey="amount" fill="var(--brand-gold)" radius={[6, 6, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm">Sin datos disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Historial de Comisiones</CardTitle>
          <p className="text-xs text-gray-500 -mt-2">Todas las transacciones de comisión</p>
        </CardHeader>
        <CardContent className="p-0">
          {history.length > 0 ? (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-gray-500">Fecha</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">Venta ID</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 hidden sm:table-cell">Cliente</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">Destino</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-center">% Comisión</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-right">Monto (COP)</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(comm.saleDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-gray-500">{comm.saleId.slice(-6)}</TableCell>
                      <TableCell className="text-sm text-gray-900 hidden sm:table-cell">{comm.clientName}</TableCell>
                      <TableCell className="text-sm text-gray-600">{comm.destination}</TableCell>
                      <TableCell className="text-center text-sm text-gray-600">{comm.commissionPercent}%</TableCell>
                      <TableCell className="text-sm font-medium text-right">{formatCurrency(comm.amount)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-[10px] px-2 py-0.5 ${getStatusBadge(statusLabels[comm.status])}`}>
                          {statusLabels[comm.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm p-6 text-center">No hay comisiones registradas aún</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
