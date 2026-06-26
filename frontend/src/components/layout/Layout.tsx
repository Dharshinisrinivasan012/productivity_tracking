import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  BookOpen,
  BarChart3,
  Calendar,
  Sparkles,
  Settings,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useAuthStore, useNotificationStore } from '@/store';
import { useSocket, requestNotificationPermission } from '@/hooks/useSocket';
import { useTheme } from '@/hooks/useTheme';
import { cn, getInitials } from '@/utils';
import { authApi } from '@/api/auth';
import { notificationsApi } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/habits', label: 'Habits', icon: Target },
  { path: '/study', label: 'Study', icon: BookOpen },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/ai', label: 'AI Assistant', icon: Sparkles },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const { user, logout, refreshToken } = useAuthStore();
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  useSocket();
  useTheme();

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(1),
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (notifData?.data) {
      setNotifications(notifData.data.data, notifData.data.unreadCount);
    }
  }, [notifData, setNotifications]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleLogout = async () => {
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }
    logout();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 72 }}
        className="hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-lg whitespace-nowrap"
              >
                PPMS
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                location.pathname === path
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft className={cn('w-5 h-5 transition-transform', !sidebarOpen && 'rotate-180')} />
        </button>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 card shadow-lg z-50">
                  <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-medium text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => { markAllAsRead(); notificationsApi.markAllAsRead(); }}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-slate-500 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <button
                          key={n._id}
                          onClick={() => { markAsRead(n._id); notificationsApi.markAsRead(n._id); }}
                          className={cn(
                            'w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0',
                            !n.read && 'bg-primary-50/50 dark:bg-primary-950/20'
                          )}
                        >
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-medium text-primary-700 dark:text-primary-300">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  getInitials(user?.name || 'U')
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r">
            <div className="p-4 border-b">
              <span className="font-bold text-lg">PPMS</span>
            </div>
            <nav className="p-3 space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                    location.pathname === path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
