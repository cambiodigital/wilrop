'use client';

import React, { useState } from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Users,
  Palette,
  Package,
  LogOut,
  Menu,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  requiresWhiteLabel?: boolean;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/reseller' },
  { id: 'products', label: 'Productos', icon: <Package className="w-5 h-5" />, href: '/reseller/productos' },
  { id: 'sales', label: 'Mis Ventas', icon: <TrendingUp className="w-5 h-5" />, href: '/reseller/ventas' },
  { id: 'commissions', label: 'Comisiones', icon: <DollarSign className="w-5 h-5" />, href: '/reseller/comisiones' },
  { id: 'clients', label: 'Mis Clientes', icon: <Users className="w-5 h-5" />, href: '/reseller/clientes' },
  { id: 'whitelabel', label: 'Marca Blanca', icon: <Palette className="w-5 h-5" />, href: '/reseller/whitelabel', requiresWhiteLabel: true },
];

function SidebarNav({
  onNavigate,
  fallbackResellerName,
  canUseWhiteLabel = false,
}: {
  onNavigate?: () => void;
  fallbackResellerName?: string;
  canUseWhiteLabel?: boolean;
}) {
  const { resellerName, logoutReseller } = useNavigationStore();
  const pathname = usePathname();
  const router = useRouter();

  const currentResellerName = resellerName || fallbackResellerName || 'Socio';

  const handleNavigate = (href: string) => {
    router.push(href);
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

  const isItemActive = (href: string) => {
    if (href === '/reseller') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5">
        <BrandWordmark />
      </div>

      <Separator className="mx-4 w-auto" />

      <div className="px-4 py-4">
        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl">
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
              {getInitials(currentResellerName || 'SR')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-card-foreground truncate">{currentResellerName}</p>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[10px] px-1.5 py-0">
              Revendedor
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Menu Principal</p>
        {menuItems.filter((item) => !item.requiresWhiteLabel || canUseWhiteLabel).map((item) => {
          const isActive = isItemActive(item.href);
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-muted-foreground'}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <Separator className="mb-3 w-auto" />
        <button
          onClick={async () => {
            try {
              await fetch('/api/reseller/auth/logout', { method: 'POST' });
            } catch {
              toast.error('No se pudo cerrar la sesión en el servidor');
            } finally {
              logoutReseller();
              router.push('/reseller/login');
              onNavigate?.();
            }
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

export default function ResellerSidebar({
  children,
  resellerName,
  canUseWhiteLabel = false,
}: {
  children: React.ReactNode;
  resellerName?: string;
  canUseWhiteLabel?: boolean;
}) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-brand-surface-light">
        <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <BrandWordmark compact />
            </div>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-card">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu de Navegacion</SheetTitle>
                </SheetHeader>
                <SidebarNav
                  onNavigate={() => setMobileOpen(false)}
                  fallbackResellerName={resellerName}
                  canUseWhiteLabel={canUseWhiteLabel}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <main className="p-4">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface-light flex">
      <aside className="w-64 bg-card border-r border-border flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <SidebarNav fallbackResellerName={resellerName} canUseWhiteLabel={canUseWhiteLabel} />
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
