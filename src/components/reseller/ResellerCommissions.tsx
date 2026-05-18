'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DollarSign, Wallet, Building2, CreditCard } from 'lucide-react';
import ResellerCommissionSummary from '@/components/reseller/ResellerCommissionSummary';
import ResellerCommissionHistory, { type CommissionEntry, type CommissionByDestination, type MonthlyCommission } from '@/components/reseller/ResellerCommissionHistory';
import { toast } from 'sonner';

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface CommissionSummary {
  totalEarned: number;
  available: number;
  pending: number;
  withdrawn: number;
}

interface CommissionData {
  summary: CommissionSummary;
  history: CommissionEntry[];
  byDestination: CommissionByDestination[];
  monthly: MonthlyCommission[];
}

export default function ResellerCommissions() {
  const [data, setData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/reseller/commissions');
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Error al cargar comisiones');
        }

        setData(json.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, []);

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount, 10);
    if (isNaN(amount) || amount < 500000) {
      toast.error('El monto mínimo para retiro es $500.000 COP');
      return;
    }
    if (!bankInfo.trim()) {
      toast.error('Debe ingresar la entidad bancaria');
      return;
    }
    if (!accountNumber.trim()) {
      toast.error('Debe ingresar el número de cuenta');
      return;
    }

    toast.success(`Solicitud de retiro por ${formatCOP(amount)} enviada. Se procesará en 2-5 días hábiles.`);
    setWithdrawDialogOpen(false);
    setWithdrawAmount('');
    setBankInfo('');
    setAccountNumber('');
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Cargando comisiones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </div>
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
      {data && (
        <ResellerCommissionSummary
          summary={data.summary}
          onWithdrawClick={() => setWithdrawDialogOpen(true)}
        />
      )}

      {/* Charts & History */}
      {data && (
        <ResellerCommissionHistory
          history={data.history}
          byDestination={data.byDestination}
          monthly={data.monthly}
        />
      )}

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-500" />
              Solicitar Retiro de Comisión
            </DialogTitle>
            <DialogDescription>
              Saldo disponible:{' '}
              <span className="font-semibold text-emerald-600">
                {data ? formatCOP(data.summary.available) : '$0 COP'}
              </span>
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
              <Label htmlFor="account">Número de Cuenta</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="account"
                  placeholder="Número de cuenta"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="pl-10"
                />
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
              disabled={!withdrawAmount || !bankInfo || !accountNumber}
            >
              Solicitar Retiro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
