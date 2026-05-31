'use client';
import { formatDateShort } from '@/lib/date'

import { formatCurrency } from '@/lib/currency'


import { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, ChevronLeft, ChevronRight, Mail, MapPin, Calendar } from 'lucide-react';

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  passport: string;
  notes: string;
  totalPurchases: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

interface ResellerClientListProps {
  clients: ClientData[];
  onSelectClient: (client: ClientData) => void;
  onAddClient: () => void;
}

const ITEMS_PER_PAGE = 6;

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

export default function ResellerClientList({
  clients,
  onSelectClient,
  onAddClient,
}: ResellerClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredClients = clients.filter((client) => {
    const search = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search) ||
      client.country.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const getStatusFromActivity = (client: ClientData): string => {
    const daysSinceUpdate = (Date.now() - new Date(client.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (client.totalPurchases === 0) return 'Nuevo';
    if (daysSinceUpdate > 90) return 'Inactivo';
    return 'Activo';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Activo: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
      Inactivo: 'bg-gray-100 text-gray-500 hover:bg-gray-100',
      Nuevo: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    };
    return styles[status] || '';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o país..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Button
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25"
          onClick={onAddClient}
        >
          Agregar Cliente
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
                  <TableHead className="text-xs font-semibold hidden md:table-cell">País</TableHead>
                  <TableHead className="text-xs font-semibold hidden sm:table-cell">Registro</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Total Gastado</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.map((client, index) => {
                  const status = getStatusFromActivity(client);
                  return (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer hover:bg-amber-50/50"
                      onClick={() => onSelectClient(client)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 border border-gray-100">
                            <AvatarFallback className={`${avatarColors[index % avatarColors.length]} text-xs font-semibold`}>
                              {getInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{client.name}</p>
                            <p className="text-xs text-gray-400 sm:hidden">{client.country}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {client.country || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateShort(client.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(client.totalSpent)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-[10px] px-2 py-0.5 ${getStatusBadge(status)}`}>
                          {status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paginatedClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      {searchTerm ? 'No se encontraron clientes con la búsqueda.' : 'No hay clientes registrados. Agrega tu primer cliente.'}
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
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length)} de {filteredClients.length} clientes
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
