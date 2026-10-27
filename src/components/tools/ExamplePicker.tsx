import { cn } from '@/lib/utils';

interface ToolExample {
  id: string;
  label: string;
}

interface ExamplePickerProps<T extends ToolExample> {
  examples: readonly T[];
  onSelect: (example: T) => void;
  label?: string;
  className?: string;
}

export function ExamplePicker<T extends ToolExample>({
  examples,
  onSelect,
  label = 'Try an example',
  className,
}: ExamplePickerProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn('flex min-w-0 flex-wrap items-center gap-2', className)}>
      <span className="mr-1 text-sm font-medium text-ink-3">
        {label}
      </span>
      {examples.map((example) => (
        <button
          type="button"
          key={example.id}
          onClick={() => onSelect(example)}
          className="min-h-11 rounded-md border border-edge bg-surface px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-muted fine-pointer:min-h-9"
        >
          {example.label}
        </button>
      ))}
    </div>
  );
}
