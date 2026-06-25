'use client';

import React, { useState } from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Package,
  Bus,
  LogOut,
  Menu,
  Megaphone,
  TrendingUp,
  Users,
  Compass,
  Ship,
  BookOpen,
  Warehouse,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { Separator } from '@/components/ui/separator';
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
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/admin' },
  { id: 'destinations', label: 'Destinos', icon: <MapPin className="w-5 h-5" />, href: '/admin/destinos' },
  { id: 'hotels', label: 'Hoteles', icon: <Building2 className="w-5 h-5" />, href: '/admin/hoteles' },
  { id: 'allotments', label: 'Cupos', icon: <Warehouse className="w-5 h-5" />, href: '/admin/habitaciones' },
  { id: 'excursions', label: 'Excursiones', icon: <Compass className="w-5 h-5" />, href: '/admin/excursiones' },
  { id: 'packages', label: 'Paquetes', icon: <Package className="w-5 h-5" />, href: '/admin/paquetes' },
  { id: 'custom-packages', label: 'Paquetes Armados', icon: <Package className="w-5 h-5" />, href: '/admin/paquetes-personalizados' },
  { id: 'transport', label: 'Transporte', icon: <Bus className="w-5 h-5" />, href: '/admin/transportes' },
  { id: 'cruises', label: 'Cruceros', icon: <Ship className="w-5 h-5" />, href: '/admin/cruceros' },
  { id: 'marketing', label: 'Marketing', icon: <Megaphone className="w-5 h-5" />, href: '/admin/marketing-modal' },
  { id: 'documentation', label: 'Documentación', icon: <BookOpen className="w-5 h-5" />, href: '/admin/documentacion' },
];

const userMenuItems: MenuItem[] = [
  { id: 'resellers', label: 'Revendedores', icon: <TrendingUp className="w-5 h-5" />, href: '/admin/revendedores' },
  { id: 'subagents', label: 'Subagentes', icon: <Users className="w-5 h-5" />, href: '/admin/subagentes' },
];

function SidebarNav({ onNavigate, fallbackAdminName }: { onNavigate?: () => void; fallbackAdminName?: string }) {
  const { adminName, logoutAdmin } = useNavigationStore();
  const pathname = usePathname();
  const router = useRouter();

  const currentAdminName = adminName || fallbackAdminName || 'Admin';

  const handleNavigate = (href: string) => {
    router.push(href);
    onNavigate?.();
  };

  const isItemActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
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
        <BrandWordmark compact />
        <div>
          <h2 className="font-bold text-card-foreground text-sm leading-none">Willro</h2>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      <Separator className="mx-4 w-auto" />

      <div className="px-4 py-4">
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-accent">
          <Avatar className="w-10 h-10 border-2 border-border">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
              {getInitials(currentAdminName || 'AD')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-card-foreground truncate">{currentAdminName}</p>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Administrador</Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Menú Principal</p>
        {menuItems.map((item) => {
          const isActive = isItemActive(item.href);
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <span className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}

        <Separator className="my-3 w-auto" />

        <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Usuarios B2B</p>
        {userMenuItems.map((item) => {
          const isActive = isItemActive(item.href);
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <span className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}>{item.icon}</span>
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
              await fetch('/api/admin/auth/logout', { method: 'POST' });
            } catch {
              toast.error('No se pudo cerrar la sesión en el servidor');
            } finally {
              logoutAdmin();
              router.push('/admin/login');
              onNavigate?.();
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({ children, adminName }: { children: React.ReactNode; adminName?: string }) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="admin-theme min-h-screen bg-background text-foreground">
        <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <BrandWordmark compact />
              <span className="font-bold text-card-foreground text-sm">Willro Admin</span>
            </div>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menú de Administración</SheetTitle>
                </SheetHeader>
                <SidebarNav onNavigate={() => setMobileOpen(false)} fallbackAdminName={adminName} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <main className="p-4">{children}</main>
      </div>
    );
  }

  return (
    <div className="admin-theme min-h-screen bg-background text-foreground flex">
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <SidebarNav fallbackAdminName={adminName} />
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
