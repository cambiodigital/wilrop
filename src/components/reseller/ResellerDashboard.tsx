'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  Link2,
  Eye,
  UserPlus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const monthlySalesData = [
  { month: 'Ene', ventas: 8200000 },
  { month: 'Feb', ventas: 9500000 },
  { month: 'Mar', ventas: 10100000 },
  { month: 'Abr', ventas: 9800000 },
  { month: 'May', ventas: 11200000 },
  { month: 'Jun', ventas: 12450000 },
];

const topDestinationsData = [
  { name: 'Cartagena', ventas: 42 },
  { name: 'San Andrés', ventas: 28 },
  { name: 'Medellín', ventas: 24 },
  { name: 'Santa Marta', ventas: 18 },
  { name: 'Bogotá', ventas: 12 },
];

const recentSales = [
  {
    id: 'V-1024',
    cliente: 'María Fernanda López',
    destino: 'Cartagena',
    paquete: 'Escapada Romántica',
    fecha: '15 Jun 2025',
    total: 4900000,
    comision: 735000,
    estado: 'Completada',
  },
  {
    id: 'V-1023',
    cliente: 'Carlos Andrés Martínez',
    destino: 'San Andrés',
    paquete: 'All Inclusive',
    fecha: '12 Jun 2025',
    total: 6200000,
    comision: 930000,
    estado: 'Completada',
  },
  {
    id: 'V-1022',
    cliente: 'Ana Sofía Rodríguez',
    destino: 'Medellín',
    paquete: 'Experiencia Urbana',
    fecha: '10 Jun 2025',
    total: 3300000,
    comision: 495000,
    estado: 'Pendiente',
  },
  {
    id: 'V-1021',
    cliente: 'Juan Pablo Gómez',
    destino: 'Santa Marta',
    paquete: 'Aventura en Tayrona',
    fecha: '08 Jun 2025',
    total: 2760000,
    comision: 386400,
    estado: 'Completada',
  },
  {
    id: 'V-1020',
    cliente: 'Laura Valentina Pérez',
    destino: 'Amazonas',
    paquete: 'Expedición Amazónica',
    fecha: '05 Jun 2025',
    total: 7300000,
    comision: 1022000,
    estado: 'Pendiente',
  },
];

const statsCards = [
  {
    title: 'Ventas del Mes',
    value: '$12.450.000',
    subtitle: 'COP',
    change: '+15%',
    changeType: 'positive' as const,
    icon: <TrendingUp className="w-5 h-5" />,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Comisiones Ganadas',
    value: '$1.875.000',
    subtitle: 'COP',
    change: '+22%',
    changeType: 'positive' as const,
    icon: <DollarSign className="w-5 h-5" />,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Clientes Activos',
    value: '47',
    subtitle: '',
    change: '+8',
    changeType: 'positive' as const,
    icon: <Users className="w-5 h-5" />,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Reservas Pendientes',
    value: '8',
    subtitle: '',
    change: '-3',
    changeType: 'neutral' as const,
    icon: <Clock className="w-5 h-5" />,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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

export default function ResellerDashboard() {
  const router = useRouter();

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
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs px-3 py-1">
            📈 Mes en crecimiento
          </Badge>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                      {stat.subtitle && (
                        <span className="text-sm text-gray-400 ml-1">{stat.subtitle}</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <span
                        className={`text-xs font-semibold ${
                          stat.changeType === 'positive' ? 'text-emerald-600' : 'text-gray-500'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-400">vs mes anterior</span>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <span className={stat.iconColor}>{stat.icon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Ventas Mensuales</CardTitle>
              <p className="text-xs text-gray-500 -mt-2">Últimos 6 meses</p>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySalesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fill="url(#colorVentas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Destinations */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top Destinos</CardTitle>
              <p className="text-xs text-gray-500 -mt-2">Ventas este mes</p>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDestinationsData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                      width={75}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    />
                    <Bar dataKey="ventas" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold text-gray-500">Cliente</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500">Destino</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 hidden sm:table-cell">Paquete</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 text-right">Total</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 text-right hidden sm:table-cell">Comisión</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale) => (
                  <TableRow key={sale.id} className="cursor-pointer hover:bg-amber-50/50">
                    <TableCell className="font-medium text-sm text-gray-900">{sale.cliente}</TableCell>
                    <TableCell className="text-sm text-gray-600">{sale.destino}</TableCell>
                    <TableCell className="text-sm text-gray-500 hidden sm:table-cell">{sale.paquete}</TableCell>
                    <TableCell className="text-sm text-gray-500 hidden md:table-cell">{sale.fecha}</TableCell>
                    <TableCell className="text-sm font-medium text-gray-900 text-right">{formatCOP(sale.total)}</TableCell>
                    <TableCell className="text-sm font-medium text-emerald-600 text-right hidden sm:table-cell">
                      {formatCOP(sale.comision)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`text-[10px] px-2 py-0.5 ${
                          sale.estado === 'Completada'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        {sale.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                className="h-auto py-4 flex flex-col gap-2 border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-all"
                onClick={() => router.push('/reseller/ventas')}
              >
                <Link2 className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">Crear Enlace de Venta</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-all"
                onClick={() => router.push('/reseller/comisiones')}
              >
                <Eye className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">Ver Comisión</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-all"
                onClick={() => router.push('/reseller/clientes')}
              >
                <UserPlus className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">Invitar Cliente</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
