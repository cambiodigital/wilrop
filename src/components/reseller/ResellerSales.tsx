'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/dialog';
import {
  Search,
  Download,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface Sale {
  id: string;
  cliente: string;
  email: string;
  destino: string;
  paquete: string;
  fechaViaje: string;
  total: number;
  comision: number;
  estado: 'Completada' | 'Pendiente' | 'Cancelada';
}

const allSales: Sale[] = [
  { id: 'V-1024', cliente: 'María Fernanda López', email: 'maria.lopez@gmail.com', destino: 'Cartagena', paquete: 'Escapada Romántica', fechaViaje: '20 Jul 2025', total: 4900000, comision: 735000, estado: 'Completada' },
  { id: 'V-1023', cliente: 'Carlos Andrés Martínez', email: 'carlos.m@gmail.com', destino: 'San Andrés', paquete: 'All Inclusive', fechaViaje: '25 Jul 2025', total: 6200000, comision: 930000, estado: 'Completada' },
  { id: 'V-1022', cliente: 'Ana Sofía Rodríguez', email: 'ana.r@gmail.com', destino: 'Medellín', paquete: 'Experiencia Urbana', fechaViaje: '18 Jul 2025', total: 3300000, comision: 495000, estado: 'Pendiente' },
  { id: 'V-1021', cliente: 'Juan Pablo Gómez', email: 'juan.g@gmail.com', destino: 'Santa Marta', paquete: 'Aventura en Tayrona', fechaViaje: '22 Jul 2025', total: 2760000, comision: 386400, estado: 'Completada' },
  { id: 'V-1020', cliente: 'Laura Valentina Pérez', email: 'laura.p@gmail.com', destino: 'Amazonas', paquete: 'Expedición Amazónica', fechaViaje: '15 Ago 2025', total: 7300000, comision: 1022000, estado: 'Pendiente' },
  { id: 'V-1019', cliente: 'Diego Alejandro Ruiz', email: 'diego.r@gmail.com', destino: 'Cartagena', paquete: 'Premium Experience', fechaViaje: '10 Jul 2025', total: 11600000, comision: 1740000, estado: 'Completada' },
  { id: 'V-1018', cliente: 'Valentina Morales', email: 'val.morales@gmail.com', destino: 'San Andrés', paquete: 'Providencia Escapada', fechaViaje: '05 Ago 2025', total: 8400000, comision: 1176000, estado: 'Pendiente' },
  { id: 'V-1017', cliente: 'Santiago Hernández', email: 'santiago.h@gmail.com', destino: 'Medellín', paquete: 'Paisajes de Antioquia', fechaViaje: '28 Jul 2025', total: 3900000, comision: 546000, estado: 'Completada' },
  { id: 'V-1016', cliente: 'Camila Arias Toro', email: 'camila.a@gmail.com', destino: 'Bogotá', paquete: 'Capital Cultural', fechaViaje: '02 Jul 2025', total: 2300000, comision: 322000, estado: 'Completada' },
  { id: 'V-1015', cliente: 'Nicolás Esteban Vargas', email: 'nicolas.v@gmail.com', destino: 'Cocora', paquete: 'Ruta del Café', fechaViaje: '12 Jul 2025', total: 1960000, comision: 294000, estado: 'Cancelada' },
  { id: 'V-1014', cliente: 'Isabella Ramírez', email: 'isabella.r@gmail.com', destino: 'Cartagena', paquete: 'Cartagena en Familia', fechaViaje: '08 Ago 2025', total: 6400000, comision: 896000, estado: 'Pendiente' },
  { id: 'V-1013', cliente: 'Mateo David Sánchez', email: 'mateo.s@gmail.com', destino: 'Popayán', paquete: 'Gastronómico', fechaViaje: '30 Jul 2025', total: 2700000, comision: 378000, estado: 'Completada' },
];

const ITEMS_PER_PAGE = 8;

export default function ResellerSales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = allSales.filter((sale) => {
    const matchSearch =
      sale.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.paquete.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todas' || sale.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalVentas = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalComisiones = filteredSales.reduce((sum, s) => sum + s.comision, 0);

  const getStatusBadge = (estado: string) => {
    const styles: Record<string, string> = {
      Completada: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
      Pendiente: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
      Cancelada: 'bg-red-100 text-red-700 hover:bg-red-100',
    };
    return styles[estado] || '';
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
          <h1 className="text-2xl font-bold text-gray-900">Mis Ventas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona todas tus transacciones</p>
        </div>
        <Button
          variant="outline"
          className="border-amber-200 text-amber-700 hover:bg-amber-50"
          onClick={() => alert('Exportación simulada. En producción, se descargaría un archivo CSV.')}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Ventas ({filteredSales.length})</p>
                <p className="text-xl font-bold text-gray-900">{formatCOP(totalVentas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Comisiones</p>
                <p className="text-xl font-bold text-emerald-600">{formatCOP(totalComisiones)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, destino o paquete..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="Completada">Completadas</SelectItem>
                <SelectItem value="Pendiente">Pendientes</SelectItem>
                <SelectItem value="Cancelada">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold text-gray-500">ID</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500">Cliente</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 hidden lg:table-cell">Email</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500">Destino</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 hidden md:table-cell">Paquete</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 hidden sm:table-cell">Fecha Viaje</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 text-right">Total</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 text-right hidden sm:table-cell">Comisión</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSales.map((sale) => (
                  <TableRow
                    key={sale.id}
                    className="cursor-pointer hover:bg-amber-50/50"
                    onClick={() => setSelectedSale(sale)}
                  >
                    <TableCell className="text-xs font-mono text-gray-500">{sale.id}</TableCell>
                    <TableCell className="font-medium text-sm text-gray-900">{sale.cliente}</TableCell>
                    <TableCell className="text-sm text-gray-500 hidden lg:table-cell">{sale.email}</TableCell>
                    <TableCell className="text-sm text-gray-600">{sale.destino}</TableCell>
                    <TableCell className="text-sm text-gray-500 hidden md:table-cell">{sale.paquete}</TableCell>
                    <TableCell className="text-sm text-gray-500 hidden sm:table-cell">{sale.fechaViaje}</TableCell>
                    <TableCell className="text-sm font-medium text-gray-900 text-right">{formatCOP(sale.total)}</TableCell>
                    <TableCell className="text-sm font-medium text-emerald-600 text-right hidden sm:table-cell">
                      {formatCOP(sale.comision)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`text-[10px] px-2 py-0.5 ${getStatusBadge(sale.estado)}`}>
                        {sale.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedSales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                      No se encontraron ventas con los filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-gray-500">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredSales.length)} de {filteredSales.length} ventas
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    className={`h-8 w-8 text-xs ${currentPage === page ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sale Detail Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Venta {selectedSale?.id}</DialogTitle>
            <DialogDescription>Información completa de la transacción</DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p className="text-sm font-medium text-gray-900">{selectedSale.cliente}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-600">{selectedSale.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Destino</p>
                  <p className="text-sm font-medium text-gray-900">{selectedSale.destino}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Paquete</p>
                  <p className="text-sm text-gray-600">{selectedSale.paquete}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha de Viaje</p>
                  <p className="text-sm text-gray-600">{selectedSale.fechaViaje}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <Badge className={`text-[10px] px-2 py-0.5 mt-1 ${getStatusBadge(selectedSale.estado)}`}>
                    {selectedSale.estado}
                  </Badge>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Venta</span>
                  <span className="text-lg font-bold text-gray-900">{formatCOP(selectedSale.total)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-500">Tu Comisión</span>
                  <span className="text-lg font-bold text-emerald-600">{formatCOP(selectedSale.comision)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
