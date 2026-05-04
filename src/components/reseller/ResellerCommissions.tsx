'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DollarSign,
  Wallet,
  Clock,
  ArrowDownToLine,
  TrendingUp,
  Building2,
  CreditCard,
} from 'lucide-react';
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

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface Commission {
  id: string;
  fecha: string;
  ventaId: string;
  cliente: string;
  destino: string;
  porcentaje: number;
  monto: number;
  estado: 'Disponible' | 'Pendiente' | 'Retirado';
}

const commissionHistory: Commission[] = [
  { id: 'C-056', fecha: '15 Jun 2025', ventaId: 'V-1024', cliente: 'María Fernanda López', destino: 'Cartagena', porcentaje: 15, monto: 735000, estado: 'Disponible' },
  { id: 'C-055', fecha: '12 Jun 2025', ventaId: 'V-1023', cliente: 'Carlos Andrés Martínez', destino: 'San Andrés', porcentaje: 15, monto: 930000, estado: 'Disponible' },
  { id: 'C-054', fecha: '10 Jun 2025', ventaId: 'V-1022', cliente: 'Ana Sofía Rodríguez', destino: 'Medellín', porcentaje: 15, monto: 495000, estado: 'Pendiente' },
  { id: 'C-053', fecha: '08 Jun 2025', ventaId: 'V-1021', cliente: 'Juan Pablo Gómez', destino: 'Santa Marta', porcentaje: 14, monto: 386400, estado: 'Disponible' },
  { id: 'C-052', fecha: '05 Jun 2025', ventaId: 'V-1020', cliente: 'Laura Valentina Pérez', destino: 'Amazonas', porcentaje: 14, monto: 1022000, estado: 'Pendiente' },
  { id: 'C-051', fecha: '01 Jun 2025', ventaId: 'V-1019', cliente: 'Diego Alejandro Ruiz', destino: 'Cartagena', porcentaje: 15, monto: 1740000, estado: 'Retirado' },
  { id: 'C-050', fecha: '28 May 2025', ventaId: 'V-1018', cliente: 'Valentina Morales', destino: 'San Andrés', porcentaje: 14, monto: 1176000, estado: 'Retirado' },
  { id: 'C-049', fecha: '25 May 2025', ventaId: 'V-1017', cliente: 'Santiago Hernández', destino: 'Medellín', porcentaje: 14, monto: 546000, estado: 'Retirado' },
  { id: 'C-048', fecha: '22 May 2025', ventaId: 'V-1016', cliente: 'Camila Arias Toro', destino: 'Bogotá', porcentaje: 14, monto: 322000, estado: 'Disponible' },
  { id: 'C-047', fecha: '20 May 2025', ventaId: 'V-1015', cliente: 'Nicolás Esteban Vargas', destino: 'Cocora', porcentaje: 15, monto: 294000, estado: 'Retirado' },
];

const commissionByDestination = [
  { name: 'Cartagena', value: 3475000, color: 'var(--brand-gold)' },
  { name: 'San Andrés', value: 2106000, color: 'var(--brand-gold-hover)' },
  { name: 'Amazonas', value: 1022000, color: 'var(--brand-teal)' },
  { name: 'Medellín', value: 1041000, color: 'var(--brand-surface)' },
  { name: 'Otros', value: 1106000, color: 'var(--brand-line)' },
];

const summaryCards = [
  {
    title: 'Total Ganado',
    value: '$8.750.000',
    subtitle: 'COP este año',
    icon: <TrendingUp className="w-5 h-5" />,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    textColor: 'text-gray-900',
  },
  {
    title: 'Disponible para Retiro',
    value: '$3.250.000',
    subtitle: 'COP disponible',
    icon: <Wallet className="w-5 h-5" />,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    textColor: 'text-emerald-600',
  },
  {
    title: 'Pendiente de Confirmación',
    value: '$2.100.000',
    subtitle: 'COP pendiente',
    icon: <Clock className="w-5 h-5" />,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    textColor: 'text-orange-600',
  },
  {
    title: 'Retirado Este Año',
    value: '$3.400.000',
    subtitle: 'COP retirado',
    icon: <ArrowDownToLine className="w-5 h-5" />,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-600',
  },
];

const getStatusBadge = (estado: string) => {
  const styles: Record<string, string> = {
    Disponible: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    Pendiente: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    Retirado: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
  };
  return styles[estado] || '';
};

function PieChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-700">{payload[0].payload.name}</p>
        <p className="text-sm font-semibold text-amber-600">{formatCOP(payload[0].payload.value)}</p>
      </div>
    );
  }
  return null;
}

export default function ResellerCommissions() {
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankInfo, setBankInfo] = useState('');

  const handleWithdraw = () => {
    alert(`Solicitud de retiro por ${withdrawAmount} COP enviada exitosamente.\nBanco: ${bankInfo}\n\nEn producción, se procesaría la solicitud.`);
    setWithdrawDialogOpen(false);
    setWithdrawAmount('');
    setBankInfo('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Comisiones</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus ganancias y solicita retiros</p>
        </div>
        <Button
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25"
          onClick={() => setWithdrawDialogOpen(true)}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Solicitar Retiro
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                    <p className={`text-2xl font-bold mt-1 ${card.textColor}`}>{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <span className={card.iconColor}>{card.icon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={commissionByDestination}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {commissionByDestination.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 ml-2">
                {commissionByDestination.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { month: 'Ene', comision: 1200000 },
                    { month: 'Feb', comision: 1450000 },
                    { month: 'Mar', comision: 1680000 },
                    { month: 'Abr', comision: 1520000 },
                    { month: 'May', comision: 1875000 },
                    { month: 'Jun', comision: 2050000 },
                  ]}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    formatter={(value: number) => [formatCOP(value), 'Comisión']}
                  />
                  <Bar dataKey="comision" fill="var(--brand-gold)" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
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
                {commissionHistory.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell className="text-sm text-gray-600">{comm.fecha}</TableCell>
                    <TableCell className="text-xs font-mono text-gray-500">{comm.ventaId}</TableCell>
                    <TableCell className="text-sm text-gray-900 hidden sm:table-cell">{comm.cliente}</TableCell>
                    <TableCell className="text-sm text-gray-600">{comm.destino}</TableCell>
                    <TableCell className="text-center text-sm text-gray-600">{comm.porcentaje}%</TableCell>
                    <TableCell className="text-sm font-medium text-right">{formatCOP(comm.monto)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`text-[10px] px-2 py-0.5 ${getStatusBadge(comm.estado)}`}>
                        {comm.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-500" />
              Solicitar Retiro de Comisión
            </DialogTitle>
            <DialogDescription>
              Saldo disponible: <span className="font-semibold text-emerald-600">$3.250.000 COP</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a Retirar (COP)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-gray-400">Monto mínimo: $500.000 COP</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank">Entidad Bancaria</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="bank"
                  placeholder="Ej: Bancolombia, Davivienda..."
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Número de Cuenta</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Número de cuenta" className="pl-10" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              onClick={handleWithdraw}
              disabled={!withdrawAmount || !bankInfo}
            >
              Solicitar Retiro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
