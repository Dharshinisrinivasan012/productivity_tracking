import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { notificationsApi } from '@/api';
import { Button, Card, Spinner, Badge, EmptyState } from '@/components/ui';
import { useNotificationStore } from '@/store';
import { formatRelative } from '@/utils';
import type { Notification } from '@/types';

export function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();
  const { markAsRead, markAllAsRead } = useNotificationStore();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => notificationsApi.getAll(1, filter === 'unread'),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: (_, id) => {
      markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data?.data || [];
  const unreadCount = data?.data?.unreadCount || 0;

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-slate-500">Stay updated with your activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          >
            <Check className="w-4 h-4" /> Mark All Read
          </Button>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${
                  filter === f ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-500'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={filter === 'unread' ? "You're all caught up!" : "No notifications yet"}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: Notification, index: number) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`p-4 transition-colors ${
                  !notification.read ? 'bg-primary-50/50 dark:bg-primary-950/20 border-primary-200 dark:border-primary-800' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-primary-500' : 'bg-slate-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-sm">{notification.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {formatRelative(notification.createdAt)}
                        </p>
                      </div>
                      <Badge variant={notification.type === 'deadline_alert' ? 'danger' : 'info'} className="shrink-0">
                        {notification.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="inline-block mt-2 text-sm text-primary-600 hover:underline"
                      >
                        View Details
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification._id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
