import { Link, useLocation } from 'react-router-dom';
import { Award } from 'lucide-react';
import { LoginArea } from './auth/LoginArea';
import { cn } from '@/lib/utils';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/badges', label: 'Gallery' },
    { path: '/badges/create', label: 'Create' },
    { path: '/badges/manage', label: 'Manage' },
    { path: '/badges/my', label: 'My Badges' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full p-2.5">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Badgestr
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-5 py-2.5 text-sm font-semibold transition-all rounded-lg',
                    isActive
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <LoginArea />
      </div>
    </nav>
  );
}
