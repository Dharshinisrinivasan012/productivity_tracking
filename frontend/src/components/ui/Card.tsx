import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export function Card({ children, className, title, action, ...props }: CardProps) {
  return (
    <div className={cn('card p-6', className)} {...props}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number;
  color?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, color = 'primary' }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 dark:bg-primary-950 text-primary-600',
    green: 'bg-green-50 dark:bg-green-950 text-green-600',
    amber: 'bg-amber-50 dark:bg-amber-950 text-amber-600',
    purple: 'bg-purple-50 dark:bg-purple-950 text-purple-600',
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p className={cn('text-xs mt-1', trend >= 0 ? 'text-green-500' : 'text-red-500')}>
              {trend >= 0 ? '+' : ''}{trend}% from last week
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-xl', colorClasses[color])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
