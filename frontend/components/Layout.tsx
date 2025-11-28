'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/auth';
import {
  LayoutDashboard,
  Package,
  Receipt,
  Truck,
  ArrowLeftRight,
  Sliders,
  History,
  Settings,
  ClipboardList,
  User,
  LogOut,
  Menu,
  X,
  RotateCcw,
  GitMerge,
  Plug,
  ShieldCheck,
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/receipts', label: 'Receipts', icon: Receipt },
    { href: '/deliveries', label: 'Deliveries', icon: Truck },
    { href: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
    { href: '/adjustments', label: 'Adjustments', icon: Sliders },
    { href: '/cycle-counts', label: 'Cycle Counts', icon: ClipboardList },
    { href: '/returns', label: 'Returns', icon: RotateCcw },
    { href: '/pick-waves', label: 'Pick Waves', icon: GitMerge },
    { href: '/suppliers', label: 'Suppliers', icon: Package },
    { href: '/analytics', label: 'Analytics', icon: LayoutDashboard },
    { href: '/history', label: 'Move History', icon: History },
    { href: '/audit-log', label: 'Audit Log', icon: ShieldCheck },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/settings/integrations', label: 'Integrations', icon: Plug },
  ];

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 dark:bg-slate-950 dark:text-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 flex flex-col border-r border-gray-100 dark:border-gray-800`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-300">StockMaster</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              if (!IconComponent) return null;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 shadow-sm dark:bg-primary-900/40 dark:text-primary-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600 hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-300'
                    }`}
                  >
                    <IconComponent
                      size={20}
                      className="transition-transform duration-200 group-hover:scale-110"
                    />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <Link
            href="/profile"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-all duration-200 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-300"
          >
            <User size={20} />
            {sidebarOpen && <span className="font-medium">My Profile</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 w-full text-left transition-all duration-200 dark:text-gray-200 dark:hover:bg-red-500/20"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-end items-center gap-2 z-10">
          <ThemeToggle />
          <NotificationBell />
        </div>
        <div className="p-6 bg-gray-50 dark:bg-slate-950 min-h-full">{children}</div>
      </main>
    </div>
  );
}

