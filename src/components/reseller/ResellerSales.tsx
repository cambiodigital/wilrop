'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ResellerSaleList from './ResellerSaleList';
import ResellerSaleForm from './ResellerSaleForm';
import ResellerSaleDetail from './ResellerSaleDetail';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SaleData {
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

export default function ResellerSales() {
  const [sales, setSales] = useState<SaleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<SaleData | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reseller/sales');
      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Error al cargar ventas');
        return;
      }

      setSales(result.data);
    } catch {
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleSelectSale = (sale: SaleData) => {
    setSelectedSale(sale);
  };

  const handleDeleteSale = () => {
    fetchSales();
    setSelectedSale(null);
  };

  const handleFormSuccess = () => {
    fetchSales();
    setAddDialogOpen(false);
  };

  const handleStatusChange = () => {
    fetchSales();
    setSelectedSale(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Ventas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {sales.length} ventas registradas
          </p>
        </div>
      </div>

      <ResellerSaleList
        sales={sales}
        onSelectSale={handleSelectSale}
        onAddSale={() => setAddDialogOpen(true)}
      />

      <ResellerSaleForm
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleFormSuccess}
      />

      <ResellerSaleDetail
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
        onDelete={handleDeleteSale}
        onStatusChange={handleStatusChange}
      />
    </motion.div>
  );
}
