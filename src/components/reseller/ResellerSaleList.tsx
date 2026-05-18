'use client';

import { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, ChevronLeft, ChevronRight, DollarSign, TrendingUp, Calendar } from 'lucide-react';

export interface SaleData {
  id: string;
  resellerId: string;
  bookingId: string | null;
  clientName: string;
  clientEmail: string;
  totalAmount: number;
  commissionAmt: number;
  netAmount: number;
  status: string;
  saleDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  bookingCode: string;
  bookingServiceName: string;
  bookingGuestName: string;
}

interface ResellerSaleListProps {
  sales: SaleData[];
  onSelectSale: (sale: SaleData) => void;
  onAddSale: () => void;
}

const ITEMS_PER_PAGE = 8;

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter((_, i) => i === 0 || i === 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const avatarColors = [
  'bg-amber-400 text-white',
  'bg-emerald-400 text-white',
  'bg-blue-400 text-white',
  'bg-purple-400 text-white',
  'bg-pink-400 text-white',
  'bg-indigo-400 text-white',
  'bg-orange-400 text-white',
  'bg-teal-400 text-white',
];

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const statusBadgeStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  confirmed: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  completed: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
};

export default function ResellerSaleList({
  sales,
  onSelectSale,
  onAddSale,
}: ResellerSaleListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSales = sales.filter((sale) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      sale.clientName.toLowerCase().includes(search) ||
      sale.clientEmail.toLowerCase().includes(search);
    const matchStatus = statusFilter === 'todas' || sale.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / ITEMS_PER_PAGE));
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const totalVentas = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalComisiones = filteredSales.reduce((sum, s) => sum + s.commissionAmt, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Ventas ({filteredSales.length})</p>
                <p className="text-lg font-bold text-gray-900">{formatCOP(totalVentas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Comisiones</p>
                <p className="text-lg font-bold text-emerald-600">{formatCOP(totalComisiones)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-44">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="confirmed">Confirmadas</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
        <Button
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25"
          onClick={onAddSale}
        >
          Registrar Venta
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold">Cliente</TableHead>
                  <TableHead className="text-xs font-semibold hidden lg:table-cell">Email</TableHead>
                  <TableHead className="text-xs font-semibold hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Total</TableHead>
                  <TableHead className="text-xs font-semibold text-right hidden sm:table-cell">Comisión</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSales.map((sale, index) => (
                  <TableRow
                    key={sale.id}
                    className="cursor-pointer hover:bg-amber-50/50"
                    onClick={() => onSelectSale(sale)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border border-gray-100">
                          <AvatarFallback className={`${avatarColors[index % avatarColors.length]} text-xs font-semibold`}>
                            {getInitials(sale.clientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sale.clientName}</p>
                          {sale.notes && (
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{sale.notes}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 hidden lg:table-cell">
                      {sale.clientEmail || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 hidden md:table-cell">
                      {formatDate(sale.saleDate)}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-900 text-right">
                      {formatCOP(sale.totalAmount)}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-emerald-600 text-right hidden sm:table-cell">
                      {formatCOP(sale.commissionAmt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`text-[10px] px-2 py-0.5 ${statusBadgeStyles[sale.status] || ''}`}>
                        {statusLabels[sale.status] || sale.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedSales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      {searchTerm || statusFilter !== 'todas'
                        ? 'No se encontraron ventas con los filtros aplicados.'
                        : 'No hay ventas registradas. Registra tu primera venta.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
    </div>
  );
}
