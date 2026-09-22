interface ToolProgressProps {
  label: string;
  value: number;
  progressLabel: string;
  onCancel?: () => void;
}

export function ToolProgress({ label, value, progressLabel, onCancel }: ToolProgressProps) {
  const progress = Math.max(0, Math.min(100, value));

  return (
    <div className="rounded-xl border border-edge bg-muted p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span role="status" aria-live="polite" className="text-xs font-semibold uppercase tracking-wider text-ink-3">
          {label}
        </span>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-sm px-2 text-xs font-semibold text-ink-3 transition-colors hover:text-ink fine-pointer:min-h-9"
          >
            Cancel
          </button>
        ) : null}
      </div>
      <div
        role="progressbar"
        aria-label={progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="h-1.5 overflow-hidden rounded-full border border-edge bg-surface"
      >
        <div
          className="h-full w-full origin-left bg-accent transition-transform duration-200"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
    </div>
  );
}
