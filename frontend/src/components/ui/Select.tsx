import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
          </label>
        )}
        <select ref={ref} id={selectId} className={cn('input', error && 'border-red-500', className)} {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
