'use client';

import { useState } from 'react';
import { LayoutDashboardIcon, PackageIcon, HistoryIcon, LogOutIcon } from 'lucide-react';
import InventoryDashboard from '@/components/inventory/inventory-dashboard';
import LogoutButton from '@/components/auth/logout-button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/40 px-2 py-1">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              KM
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Ipin Motor</p>
              <p className="text-xs text-sidebar-foreground/60">Keluar-Masuk Barang</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === 'dashboard'}
                    tooltip="Dashboard"
                    onClick={() => setActiveView('dashboard')}
                  >
                    <LayoutDashboardIcon className="size-4" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Stok Barang"
                    isActive={activeView === 'items'}
                    onClick={() => setActiveView('items')}
                  >
                    <PackageIcon className="size-4" />
                    <span>Stok Barang</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Riwayat Mutasi"
                    isActive={activeView === 'mutations'}
                    onClick={() => setActiveView('mutations')}
                  >
                    <HistoryIcon className="size-4" />
                    <span>Riwayat Mutasi</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col gap-2">
            <LogoutButton className="flex items-center gap-2 justify-start">
              <LogOutIcon className="size-4" />
              <span>Keluar</span>
            </LogoutButton>
            <SidebarSeparator />
            <p className="text-xs text-sidebar-foreground/60">&copy; {new Date().getFullYear()} Ipin Motor</p>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur md:px-6">
          <SidebarTrigger />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Inventori</span>
            <span className="text-lg font-semibold">Keluar-Masuk Barang</span>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)] bg-background px-4 pb-12 md:px-6">
          <InventoryDashboard activeView={activeView} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
