import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Activity, Settings, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Layout() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Queues', href: '/queues', icon: List },
    { name: 'Jobs Explorer', href: '/jobs', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-card p-4 flex flex-col">
        <div className="flex items-center space-x-2 px-2 py-4 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
            DS
          </div>
          <span className="font-bold text-lg tracking-tight">JobFlow</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-100',
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-100',
                    'flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors'
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-800">
          <Link
            to="/auth"
            className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="flex-shrink-0 -ml-1 mr-3 h-5 w-5" aria-hidden="true" />
            <span className="truncate">Sign out</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="h-16 border-b border-gray-800 flex items-center px-8 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <h1 className="text-xl font-semibold">
            {navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard'}
          </h1>
        </header>
        <main className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
