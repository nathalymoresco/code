'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/destinations', label: 'Destinos', icon: MapPin },
  { href: '/partners', label: 'Parceiros', icon: Users },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
        <span className="text-lg font-bold text-turquoise-400">TravelMatch</span>
        <span className="rounded bg-turquoise-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          ADMIN
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-turquoise-600/10 text-turquoise-400'
                  : 'text-sand-400 hover:bg-sand-700 hover:text-sand-200',
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-sand-700 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sand-400 transition-colors hover:bg-sand-700 hover:text-sand-200"
          data-testid="logout-button"
        >
          <LogOut className="size-5" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-sand-800 p-2 text-sand-200 shadow-lg lg:hidden"
        data-testid="mobile-menu-toggle"
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-sand-800 transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
