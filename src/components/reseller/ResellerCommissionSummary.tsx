'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Clock, ArrowDownToLine, TrendingUp } from 'lucide-react';

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface SummaryData {
  totalEarned: number;
  available: number;
  pending: number;
  withdrawn: number;
}

interface ResellerCommissionSummaryProps {
  summary: SummaryData;
  onWithdrawClick: () => void;
}

const summaryCards = [
  {
    title: 'Total Ganado',
    key: 'totalEarned' as const,
    subtitle: 'COP este año',
    icon: TrendingUp,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    textColor: 'text-gray-900',
  },
  {
    title: 'Disponible para Retiro',
    key: 'available' as const,
    subtitle: 'COP disponible',
    icon: Wallet,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    textColor: 'text-emerald-600',
  },
  {
    title: 'Pendiente de Confirmación',
    key: 'pending' as const,
    subtitle: 'COP pendiente',
    icon: Clock,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    textColor: 'text-orange-600',
  },
  {
    title: 'Retirado Este Año',
    key: 'withdrawn' as const,
    subtitle: 'COP retirado',
    icon: ArrowDownToLine,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-600',
  },
];

export default function ResellerCommissionSummary({
  summary,
  onWithdrawClick,
}: ResellerCommissionSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        const value = summary[card.key];
        return (
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
                    <p className={`text-2xl font-bold mt-1 ${card.textColor}`}>{formatCOP(value)}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
