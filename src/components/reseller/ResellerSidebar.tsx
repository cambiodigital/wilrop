'use client';

import React, { useState } from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Users,
  Palette,
  LogOut,
  Menu,
  Plane,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  view: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, view: 'reseller-dashboard' },
  { id: 'sales', label: 'Mis Ventas', icon: <TrendingUp className="w-5 h-5" />, view: 'reseller-sales' },
  { id: 'commissions', label: 'Comisiones', icon: <DollarSign className="w-5 h-5" />, view: 'reseller-commissions' },
  { id: 'clients', label: 'Mis Clientes', icon: <Users className="w-5 h-5" />, view: 'reseller-clients' },
  { id: 'whitelabel', label: 'Marca Blanca', icon: <Palette className="w-5 h-5" />, view: 'reseller-whitelabel' },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { currentView, navigate, resellerName, logoutReseller } = useNavigationStore();

  const handleNavigate = (view: string) => {
    navigate(view);
    onNavigate?.();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20">
          <Plane className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-sm leading-none">WILROP</h2>
          <p className="text-xs text-gray-500">Colombia Travel</p>
        </div>
      </div>

      <Separator className="mx-4 w-auto" />

      <div className="px-4 py-4">
        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
          <Avatar className="w-10 h-10 border-2 border-amber-200">
            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold text-sm">
              {getInitials(resellerName || 'SR')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{resellerName || 'Socio'}</p>
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px] px-1.5 py-0">
              Revendedor
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Menu Principal</p>
        {menuItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25'
                  : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <Separator className="mb-3 w-auto" />
        <button
          onClick={() => {
            logoutReseller();
            onNavigate?.();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesion
        </button>
      </div>
    </div>
  );
}

export default function ResellerSidebar({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">WILROP</span>
            </div>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-white">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu de Navegacion</SheetTitle>
                </SheetHeader>
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <main className="p-4">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <SidebarNav />
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
