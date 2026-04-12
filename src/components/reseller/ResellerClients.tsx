'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
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

type ClientStatus = 'Activo' | 'Inactivo' | 'Nuevo';

interface Booking {
  id: string;
  destino: string;
  paquete: string;
  fecha: string;
  total: number;
  estado: string;
}

interface Client {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ciudad: string;
  ultimaReserva: string;
  totalGastado: number;
  estado: ClientStatus;
  bookings: Booking[];
}

const clientsData: Client[] = [
  {
    id: 'CL-001',
    nombre: 'María Fernanda López',
    email: 'maria.lopez@gmail.com',
    telefono: '+57 301 234 5678',
    ciudad: 'Bogotá',
    ultimaReserva: '15 Jun 2025',
    totalGastado: 14700000,
    estado: 'Activo',
    bookings: [
      { id: 'V-1024', destino: 'Cartagena', paquete: 'Escapada Romántica', fecha: 'Jun 2025', total: 4900000, estado: 'Completada' },
      { id: 'V-1008', destino: 'Medellín', paquete: 'Experiencia Urbana', fecha: 'Mar 2025', total: 3300000, estado: 'Completada' },
      { id: 'V-0991', destino: 'San Andrés', paquete: 'All Inclusive', fecha: 'Ene 2025', total: 6500000, estado: 'Completada' },
    ],
  },
  {
    id: 'CL-002',
    nombre: 'Carlos Andrés Martínez',
    email: 'carlos.m@gmail.com',
    telefono: '+57 310 456 7890',
    ciudad: 'Medellín',
    ultimaReserva: '12 Jun 2025',
    totalGastado: 18600000,
    estado: 'Activo',
    bookings: [
      { id: 'V-1023', destino: 'San Andrés', paquete: 'All Inclusive', fecha: 'Jun 2025', total: 6200000, estado: 'Completada' },
      { id: 'V-1010', destino: 'Cartagena', paquete: 'Premium Experience', fecha: 'Abr 2025', total: 5800000, estado: 'Completada' },
      { id: 'V-0995', destino: 'Amazonas', paquete: 'Expedición Amazónica', fecha: 'Feb 2025', total: 6600000, estado: 'Completada' },
    ],
  },
  {
    id: 'CL-003',
    nombre: 'Ana Sofía Rodríguez',
    email: 'ana.r@gmail.com',
    telefono: '+57 320 567 8901',
    ciudad: 'Cali',
    ultimaReserva: '10 Jun 2025',
    totalGastado: 6500000,
    estado: 'Activo',
    bookings: [
      { id: 'V-1022', destino: 'Medellín', paquete: 'Experiencia Urbana', fecha: 'Jun 2025', total: 3300000, estado: 'Pendiente' },
      { id: 'V-1003', destino: 'Santa Marta', paquete: 'Aventura en Tayrona', fecha: 'Mar 2025', total: 2760000, estado: 'Completada' },
    ],
  },
  {
    id: 'CL-004',
    nombre: 'Juan Pablo Gómez',
    email: 'juan.g@gmail.com',
    telefono: '+57 315 678 9012',
    ciudad: 'Barranquilla',
    ultimaReserva: '08 Jun 2025',
    totalGastado: 9200000,
    estado: 'Activo',
    bookings: [
      { id: 'V-1021', destino: 'Santa Marta', paquete: 'Aventura en Tayrona', fecha: 'Jun 2025', total: 2760000, estado: 'Completada' },
      { id: 'V-1001', destino: 'Cartagena', paquete: 'Cartagena en Familia', fecha: 'Mar 2025', total: 3200000, estado: 'Completada' },
      { id: 'V-0988', destino: 'San Andrés', paquete: 'Providencia Escapada', fecha: 'Ene 2025', total: 3240000, estado: 'Completada' },
    ],
  },
  {
    id: 'CL-005',
    nombre: 'Laura Valentina Pérez',
    email: 'laura.p@gmail.com',
    telefono: '+57 300 789 0123',
    ciudad: 'Bucaramanga',
    ultimaReserva: '05 Jun 2025',
    totalGastado: 7300000,
    estado: 'Nuevo',
    bookings: [
      { id: 'V-1020', destino: 'Amazonas', paquete: 'Expedición Amazónica', fecha: 'Jun 2025', total: 7300000, estado: 'Pendiente' },
    ],
  },
  {
    id: 'CL-006',
    nombre: 'Diego Alejandro Ruiz',
    email: 'diego.r@gmail.com',
    telefono: '+57 311 890 1234',
    ciudad: 'Bogotá',
    ultimaReserva: '01 Jun 2025',
    totalGastado: 23400000,
    estado: 'Activo',
    bookings: [
      { id: 'V-1019', destino: 'Cartagena', paquete: 'Premium Experience', fecha: 'Jun 2025', total: 11600000, estado: 'Completada' },
      { id: 'V-0999', destino: 'San Andrés', paquete: 'All Inclusive', fecha: 'May 2025', total: 6200000, estado: 'Completada' },
      { id: 'V-0985', destino: 'Medellín', paquete: 'Paisajes de Antioquia', fecha: 'Ene 2025', total: 3900000, estado: 'Completada' },
      { id: 'V-0972', destino: 'Cartagena', paquete: 'Escapada Romántica', fecha: 'Nov 2024', total: 1700000, estado: 'Completada' },
    ],
  },
  {
    id: 'CL-007',
    nombre: 'Valentina Morales',
    email: 'val.morales@gmail.com',
    telefono: '+57 312 901 2345',
    ciudad: 'Pereira',
    ultimaReserva: '28 May 2025',
    totalGastado: 12600000,
    estado: 'Activo',
    bookings: [
      { id: 'V-1018', destino: 'San Andrés', paquete: 'Providencia Escapada', fecha: 'May 2025', total: 8400000, estado: 'Pendiente' },
      { id: 'V-0992', destino: 'Cocora', paquete: 'Ruta del Café', fecha: 'Feb 2025', total: 1960000, estado: 'Completada' },
      { id: 'V-0980', destino: 'Popayán', paquete: 'Gastronómico', fecha: 'Dic 2024', total: 2240000, estado: 'Completada' },
    ],
  },
  {
    id: 'CL-008',
    nombre: 'Santiago Hernández',
    email: 'santiago.h@gmail.com',
    telefono: '+57 305 012 3456',
    ciudad: 'Manizales',
    ultimaReserva: '25 May 2025',
    totalGastado: 11700000,
    estado: 'Activo',
    bookings: [
      { id: 'V-1017', destino: 'Medellín', paquete: 'Paisajes de Antioquia', fecha: 'May 2025', total: 3900000, estado: 'Completada' },
      { id: 'V-1005', destino: 'Cartagena', paquete: 'Cartagena en Familia', fecha: 'Abr 2025', total: 6400000, estado: 'Completada' },
      { id: 'V-0987', destino: 'Santa Marta', paquete: 'Aventura en Tayrona', fecha: 'Feb 2025', total: 1400000, estado: 'Completada' },
    ],
  },
  {
    id: 'CL-009',
    nombre: 'Camila Arias Toro',
    email: 'camila.a@gmail.com',
    telefono: '+57 313 123 4567',
    ciudad: 'Cartagena',
    ultimaReserva: '02 Jul 2025',
    totalGastado: 4600000,
    estado: 'Inactivo',
    bookings: [
      { id: 'V-1016', destino: 'Bogotá', paquete: 'Capital Cultural', fecha: 'Jul 2025', total: 2300000, estado: 'Completada' },
      { id: 'V-0998', destino: 'Cocora', paquete: 'Ruta del Café', fecha: 'May 2025', total: 2300000, estado: 'Completada' },
    ],
  },
  {
    id: 'CL-010',
    nombre: 'Nicolás Esteban Vargas',
    email: 'nicolas.v@gmail.com',
    telefono: '+57 316 234 5678',
    ciudad: 'Villavicencio',
    ultimaReserva: '30 Jul 2025',
    totalGastado: 1960000,
    estado: 'Inactivo',
    bookings: [
      { id: 'V-1015', destino: 'Cocora', paquete: 'Ruta del Café', fecha: 'Jul 2025', total: 1960000, estado: 'Cancelada' },
    ],
  },
  {
    id: 'CL-011',
    nombre: 'Isabella Ramírez',
    email: 'isabella.r@gmail.com',
    telefono: '+57 308 345 6789',
    ciudad: 'Ibagué',
    ultimaReserva: '08 Ago 2025',
    totalGastado: 6400000,
    estado: 'Nuevo',
    bookings: [
      { id: 'V-1014', destino: 'Cartagena', paquete: 'Cartagena en Familia', fecha: 'Ago 2025', total: 6400000, estado: 'Pendiente' },
    ],
  },
  {
    id: 'CL-012',
    nombre: 'Mateo David Sánchez',
    email: 'mateo.s@gmail.com',
    telefono: '+57 317 456 7890',
    ciudad: 'Pasto',
    ultimaReserva: '30 Jul 2025',
    totalGastado: 5400000,
    estado: 'Activo',
    bookings: [
      { id: 'V-1013', destino: 'Popayán', paquete: 'Gastronómico', fecha: 'Jul 2025', total: 2700000, estado: 'Completada' },
      { id: 'V-1007', destino: 'Bogotá', paquete: 'Capital Cultural', fecha: 'Abr 2025', total: 2300000, estado: 'Completada' },
    ],
  },
];

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

const getStatusBadge = (estado: string) => {
  const styles: Record<string, string> = {
    Activo: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    Inactivo: 'bg-gray-100 text-gray-500 hover:bg-gray-100',
    Nuevo: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  };
  return styles[estado] || '';
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

export default function ResellerClients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({ nombre: '', email: '', telefono: '', ciudad: '' });

  const filteredClients = clientsData.filter((client) => {
    const matchSearch =
      client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.ciudad.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || client.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddClient = () => {
    alert(`Cliente "${newClient.nombre}" agregado exitosamente.\nEn producción, se guardaría en la base de datos.`);
    setAddDialogOpen(false);
    setNewClient({ nombre: '', email: '', telefono: '', ciudad: '' });
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
          <h1 className="text-2xl font-bold text-gray-900">Mis Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {clientsData.length} clientes registrados
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25"
          onClick={() => setAddDialogOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Agregar Cliente
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o ciudad..."
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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Activo">Activos</SelectItem>
                <SelectItem value="Inactivo">Inactivos</SelectItem>
                <SelectItem value="Nuevo">Nuevos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold text-gray-500">Cliente</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 hidden lg:table-cell">Email</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 hidden md:table-cell">Teléfono</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 hidden sm:table-cell">Última Reserva</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 text-right">Total Gastado</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.map((client, index) => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer hover:bg-amber-50/50"
                    onClick={() => setSelectedClient(client)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border border-gray-100">
                          <AvatarFallback className={`${avatarColors[index % avatarColors.length]} text-xs font-semibold`}>
                            {getInitials(client.nombre)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{client.nombre}</p>
                          <p className="text-xs text-gray-400 sm:hidden">{client.ciudad}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 hidden lg:table-cell">{client.email}</TableCell>
                    <TableCell className="text-sm text-gray-500 hidden md:table-cell">{client.telefono}</TableCell>
                    <TableCell className="text-sm text-gray-500 hidden sm:table-cell">{client.ultimaReserva}</TableCell>
                    <TableCell className="text-sm font-medium text-gray-900 text-right">
                      {formatCOP(client.totalGastado)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`text-[10px] px-2 py-0.5 ${getStatusBadge(client.estado)}`}>
                        {client.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      No se encontraron clientes con los filtros aplicados.
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

      {/* Client Detail Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Cliente</DialogTitle>
            <DialogDescription>Información completa e historial de reservas</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              {/* Client Info */}
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
                <Avatar className="w-14 h-14 border-2 border-amber-200">
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-lg">
                    {getInitials(selectedClient.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedClient.nombre}</h3>
                  <Badge className={`text-[10px] px-2 py-0.5 mt-1 ${getStatusBadge(selectedClient.estado)}`}>
                    {selectedClient.estado}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400">Email</p>
                    <p className="text-sm text-gray-700">{selectedClient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400">Teléfono</p>
                    <p className="text-sm text-gray-700">{selectedClient.telefono}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400">Ciudad</p>
                    <p className="text-sm text-gray-700">{selectedClient.ciudad}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400">Última Reserva</p>
                    <p className="text-sm text-gray-700">{selectedClient.ultimaReserva}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Total Gastado</p>
                <p className="text-xl font-bold text-amber-600">{formatCOP(selectedClient.totalGastado)}</p>
              </div>

              {/* Booking History */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Historial de Reservas ({selectedClient.bookings.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedClient.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.destino}</p>
                        <p className="text-xs text-gray-500">{booking.paquete} · {booking.fecha}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCOP(booking.total)}</p>
                        <Badge
                          className={`text-[10px] px-1.5 py-0 ${
                            booking.estado === 'Completada'
                              ? 'bg-emerald-100 text-emerald-700'
                              : booking.estado === 'Pendiente'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {booking.estado}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
            <DialogDescription>Complete la información del nuevo cliente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nombre Completo</Label>
              <Input
                id="new-name"
                placeholder="Nombre y apellidos"
                value={newClient.nombre}
                onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Correo Electrónico</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-phone">Teléfono</Label>
              <Input
                id="new-phone"
                placeholder="+57 300 000 0000"
                value={newClient.telefono}
                onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-city">Ciudad</Label>
              <Input
                id="new-city"
                placeholder="Ciudad de residencia"
                value={newClient.ciudad}
                onChange={(e) => setNewClient({ ...newClient, ciudad: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              onClick={handleAddClient}
              disabled={!newClient.nombre || !newClient.email}
            >
              Agregar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
