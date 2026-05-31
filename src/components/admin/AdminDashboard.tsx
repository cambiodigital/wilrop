'use client';
import { formatCurrency } from '@/lib/currency'


import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
;
import {
  MapPin,
  Building2,
  Package,
  Star,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminStats {
  totalDestinations: number;
  totalHotels: number;
  totalPackages: number;
  featuredHotels: number;
  soldOutPackages: number;
  recentPackages: Array<{
    id: string;
    title: string;
    destinationName: string;
    price: number;
    rating: number;
    soldOut: boolean;
    category: string;
  }>;
}

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        throw new Error('Error al cargar estadísticas');
      }
      const json = await res.json();
      setStats(json.data || json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Destinos',
      value: stats?.totalDestinations ?? 0,
      icon: <MapPin className="w-5 h-5" />,
      color: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Total Hoteles',
      value: stats?.totalHotels ?? 0,
      icon: <Building2 className="w-5 h-5" />,
      color: 'text-purple-600',
      iconBg: 'bg-purple-50',
    },
    {
      title: 'Total Paquetes',
      value: stats?.totalPackages ?? 0,
      icon: <Package className="w-5 h-5" />,
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      title: 'Hoteles Destacados',
      value: stats?.featuredHotels ?? 0,
      icon: <Star className="w-5 h-5" />,
      color: 'text-primary',
      iconBg: 'bg-accent',
    },
    {
      title: 'Paquetes Agotados',
      value: stats?.soldOutPackages ?? 0,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-destructive',
      iconBg: 'bg-destructive/10',
    },
  ];

  if (error && !stats) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchStats}
              className="mt-3 text-sm text-primary font-medium underline"
            >
              Reintentar
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div className="page-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Dashboard</h1>
        <p className="mt-1">
          Resumen general de la plataforma WILROP Colombia Travel
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {statCards.map((card) => (
          <motion.div key={card.title} variants={fadeUp}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{card.title}</p>
                    {loading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Packages Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Paquetes Recientes</CardTitle>
            </div>
            <CardDescription>Los últimos 5 paquetes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stats?.recentPackages && stats.recentPackages.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentPackages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium text-sm">{pkg.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{pkg.destinationName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {pkg.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-semibold">{formatCurrency(pkg.price)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">{pkg.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pkg.soldOut ? (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                              Agotado
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/10 text-xs">
                              Disponible
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay paquetes registrados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
