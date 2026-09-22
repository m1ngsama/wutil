'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import {
  formatUuid,
  generateUuidBatch,
  MAX_UUID_BATCH_SIZE,
  MIN_UUID_BATCH_SIZE,
  type UuidVersion,
} from '@/lib/uuid-utils';
import { ToolPage } from './ToolPage';

const VERSION_OPTIONS: Array<{
  value: UuidVersion;
  label: string;
  description: string;
}> = [
  {
    value: 'v4',
    label: 'UUID v4',
    description: 'Random and widely supported',
  },
  {
    value: 'v7',
    label: 'UUID v7',
    description: 'Time-sortable, with random bits',
  },
];

export default function UuidGenerator() {
  const [version, setVersion] = useState<UuidVersion>('v4');
  const [quantity, setQuantity] = useState('1');
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);
  const [quantityError, setQuantityError] = useState('');

  const displayedUuids = useMemo(
    () => uuids.map((uuid) => formatUuid(uuid, { uppercase, hyphens })),
    [hyphens, uppercase, uuids],
  );

  const handleGenerate = (nextVersion = version) => {
    const count = Number(quantity);

    if (!Number.isInteger(count) || count < MIN_UUID_BATCH_SIZE || count > MAX_UUID_BATCH_SIZE) {
      setQuantityError(`Enter a whole number from ${MIN_UUID_BATCH_SIZE} to ${MAX_UUID_BATCH_SIZE}.`);
      return;
    }

    setQuantityError('');

    try {
      setUuids(generateUuidBatch({ version: nextVersion, count }));
    } catch {
      toast.error('UUID generation is unavailable in this browser');
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => handleGenerate(), []);

  const handleVersionChange = (nextVersion: UuidVersion) => {
    setVersion(nextVersion);
    handleGenerate(nextVersion);
  };

  const handleDownload = () => {
    if (displayedUuids.length === 0) return;

    const blob = new Blob([`${displayedUuids.join('\n')}\n`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uuid-${version}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('UUID file downloaded');
  };

  return (
    <ToolPage
      toolId="uuid-generator"
      title="UUID Generator"
      description="Create RFC 9562 UUID v4 or v7 identifiers in batches, without sending anything to a server."
      width="narrow"
    >
      <div className="space-y-5">
        <form
          className="rounded-xl border border-edge bg-surface p-5 sm:p-6"
          aria-label="Generation settings"
          onSubmit={(event) => {
            event.preventDefault();
            handleGenerate();
          }}
        >
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              UUID version
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {VERSION_OPTIONS.map((option) => (
                <label key={option.value} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="uuid-version"
                    value={option.value}
                    checked={version === option.value}
                    onChange={() => handleVersionChange(option.value)}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-16 flex-col justify-center rounded-lg border border-edge bg-canvas px-4 py-3 transition-colors hover:border-edge-strong peer-checked:border-accent peer-checked:bg-muted peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--w-ring)]">
                    <span className="text-sm font-semibold text-ink">{option.label}</span>
                    <span className="mt-0.5 text-xs leading-relaxed text-ink-3">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <div>
              <label htmlFor="uuid-quantity" className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Quantity
              </label>
              <input
                id="uuid-quantity"
                type="number"
                min={MIN_UUID_BATCH_SIZE}
                max={MAX_UUID_BATCH_SIZE}
                step={1}
                inputMode="numeric"
                enterKeyHint="done"
                value={quantity}
                aria-describedby={quantityError ? 'uuid-quantity-error' : 'uuid-quantity-hint'}
                aria-invalid={quantityError ? true : undefined}
                onChange={(event) => {
                  setQuantity(event.target.value);
                  setQuantityError('');
                }}
                className="mt-2 h-11 w-full rounded-md border border-edge bg-canvas px-3 font-mono text-sm text-ink outline-none transition-colors focus:border-accent"
              />
              {quantityError ? (
                <p id="uuid-quantity-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">
                  {quantityError}
                </p>
              ) : (
                <p id="uuid-quantity-hint" className="mt-1.5 text-xs text-ink-3">
                  Generate 1–100 at a time.
                </p>
              )}
            </div>

            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Format
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={uppercase}
                  onClick={() => setUppercase((enabled) => !enabled)}
                  className="flex min-h-11 items-center gap-2 rounded-md px-2 text-left text-sm text-ink-2 hover:bg-muted"
                >
                  <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${uppercase ? 'bg-accent' : 'bg-edge-strong'}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface shadow transition-transform ${uppercase ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </span>
                  Uppercase
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={hyphens}
                  onClick={() => setHyphens((enabled) => !enabled)}
                  className="flex min-h-11 items-center gap-2 rounded-md px-2 text-left text-sm text-ink-2 hover:bg-muted"
                >
                  <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${hyphens ? 'bg-accent' : 'bg-edge-strong'}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface shadow transition-transform ${hyphens ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </span>
                  Hyphens
                </button>
              </div>
            </fieldset>
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full">
            <RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />
            Generate {version} UUID{Number(quantity) === 1 ? '' : 's'}
          </Button>
        </form>

        <section className="rounded-xl border border-edge bg-surface p-5 sm:p-6" aria-labelledby="uuid-results-heading">
          <div className="field-header flex-wrap">
            <h2 id="uuid-results-heading" className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              Generated UUIDs
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={displayedUuids.length === 0} onClick={handleDownload}>
                <Download aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />
                Download .txt
              </Button>
              <CopyButton value={displayedUuids.join('\n')} label="Copy all" />
            </div>
          </div>
          <p role="status" aria-live="polite" className="sr-only">
            {displayedUuids.length > 0
              ? `${displayedUuids.length} ${version} UUID${displayedUuids.length === 1 ? '' : 's'} ready`
              : ''}
          </p>

          {displayedUuids.length > 0 ? (
            <ol
              aria-label="Generated UUIDs"
              tabIndex={0}
              className="max-h-[28rem] overflow-y-auto rounded-lg border border-edge bg-canvas"
            >
              {displayedUuids.map((uuid, index) => (
                <li
                  key={`${uuid}-${index}`}
                  className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-edge px-3 py-2 last:border-b-0 sm:px-4"
                >
                  <span aria-hidden="true" className="w-6 text-right font-mono text-xs tabular-nums text-ink-3">
                    {index + 1}
                  </span>
                  <code className="min-w-0 break-all font-mono text-xs leading-relaxed text-ink sm:text-sm">
                    {uuid}
                  </code>
                  <CopyButton value={uuid} aria-label={`Copy UUID ${index + 1}`} successMessage="UUID copied" />
                </li>
              ))}
            </ol>
          ) : (
            <div aria-hidden="true" className="min-h-14 rounded-lg border border-edge bg-canvas" />
          )}
        </section>

        <p className="text-center text-xs leading-relaxed text-ink-3">
          A UUID is an identifier, not a secret. v7 values also reveal when they were created.
        </p>
      </div>
    </ToolPage>
  );
}
