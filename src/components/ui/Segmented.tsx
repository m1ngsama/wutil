import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SegmentedProps<T extends string> {
  options: readonly { value: T; label: ReactNode; ariaLabel?: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  buttonClassName: string;
  labelledBy?: string;
  ariaLabel?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  buttonClassName,
  labelledBy,
  ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : ariaLabel}
      className={cn('flex max-w-full flex-wrap overflow-hidden rounded-md border border-edge', className)}
    >
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          aria-pressed={value === option.value}
          aria-label={option.ariaLabel}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-11 grow font-medium transition-colors focus-visible:-outline-offset-2',
            value === option.value ? 'bg-accent text-accent-fg' : 'bg-surface text-ink hover:bg-muted',
            buttonClassName,
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
