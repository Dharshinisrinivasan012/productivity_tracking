import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={cn('input', error && 'border-red-500', className)} {...props} />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
