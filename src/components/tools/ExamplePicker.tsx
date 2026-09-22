export interface ToolExample {
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
    <div className={className}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
        {label}
      </p>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            type="button"
            key={example.id}
            onClick={() => onSelect(example)}
            className="min-h-11 rounded-md border border-edge bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] fine-pointer:min-h-9"
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
