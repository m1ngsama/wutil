'use client';

import { useMemo, useRef, useState } from 'react';
import { FileCheck2, FileUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { ToolPage } from '@/components/tools/ToolPage';
import { copyText } from '@/lib/clipboard';
import {
  HASH_ALGORITHMS,
  MAX_HASH_FILE_SIZE,
  digestData,
  hashesMatch,
  normalizeExpectedHash,
  validateExpectedHash,
  validateHashFile,
  type HashAlgorithmName,
} from '@/lib/hash-utils';

type HashResult = { name: HashAlgorithmName; value: string };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function generateTextHashes(input: string): Promise<HashResult[]> {
  const data = new TextEncoder().encode(input);
  const results: HashResult[] = [];
  for (const { name } of HASH_ALGORITHMS) {
    results.push({ name, value: await digestData(data, name) });
  }
  return results;
}

export default function HashGeneratorComponent() {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileAlgorithm, setFileAlgorithm] = useState<HashAlgorithmName>('SHA-256');
  const [fileHash, setFileHash] = useState('');
  const [expectedHash, setExpectedHash] = useState('');
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const textRequestId = useRef(0);
  const requestId = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expectedError = useMemo(
    () => validateExpectedHash(expectedHash, fileAlgorithm),
    [expectedHash, fileAlgorithm],
  );
  const comparison = fileHash && expectedHash.trim() && !expectedError
    ? hashesMatch(fileHash, expectedHash)
    : null;

  const resetFileResult = () => {
    requestId.current += 1;
    setProcessing(false);
    setFileHash('');
  };

  const handleInput = (value: string) => {
    setInput(value);
    const currentRequest = ++textRequestId.current;
    if (!value) {
      setHashes([]);
      return;
    }
    void generateTextHashes(value)
      .then((results) => {
        if (textRequestId.current === currentRequest) setHashes(results);
      })
      .catch(() => {
        if (textRequestId.current === currentRequest) setHashes([]);
        toast.error('Hashing failed');
      });
  };

  const chooseFile = (nextFile: File | null) => {
    if (!nextFile) return;
    const validation = validateHashFile(nextFile);
    if (validation === 'too-large') {
      toast.error(`Choose a file no larger than ${MAX_HASH_FILE_SIZE / 1024 / 1024} MB`);
      return;
    }
    if (validation === 'empty') {
      toast.error('Choose a non-empty file');
      return;
    }
    resetFileResult();
    setFile(nextFile);
    setExpectedHash('');
  };

  const hashFile = async () => {
    if (!file || processing) return;
    const currentRequest = ++requestId.current;
    setProcessing(true);
    setFileHash('');

    try {
      const bytes = await file.arrayBuffer();
      const value = await digestData(bytes, fileAlgorithm);
      if (requestId.current !== currentRequest) return;
      setFileHash(value);
      toast.success(`${fileAlgorithm} ready`);
    } catch {
      if (requestId.current === currentRequest) toast.error('File hashing failed');
    } finally {
      if (requestId.current === currentRequest) setProcessing(false);
    }
  };

  const clearFile = () => {
    resetFileResult();
    setFile(null);
    setExpectedHash('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const checksumDownload = file && fileHash
    ? `data:text/plain;charset=utf-8,${encodeURIComponent(`${fileHash}  ${file.name}\n`)}`
    : undefined;

  return (
    <ToolPage
      toolId="hash-generator"
      title="Hash Generator"
      description="Generate and verify SHA checksums for text or files. Everything stays on this device."
      width="narrow"
    >
      <div className="mb-6 inline-flex overflow-hidden rounded-md border border-edge" role="group" aria-label="Hash input type">
        {(['text', 'file'] as const).map((nextMode) => (
          <button
            key={nextMode}
            type="button"
            aria-pressed={mode === nextMode}
            onClick={() => setMode(nextMode)}
            className={`min-h-11 px-4 text-sm font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--w-ring)] fine-pointer:min-h-9 ${mode === nextMode ? 'bg-accent text-accent-fg' : 'bg-surface text-ink hover:bg-muted'}`}
          >
            {nextMode}
          </button>
        ))}
      </div>

      {mode === 'text' ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hash-input" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Text to hash</label>
            <textarea
              id="hash-input"
              className="h-32 w-full resize-none rounded-lg border border-edge bg-surface p-4 font-mono text-sm text-ink placeholder:text-ink-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas"
              placeholder="Type or paste text to hash…"
              value={input}
              onChange={(event) => handleInput(event.target.value)}
              spellCheck={false}
            />
          </div>

          {hashes.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-edge bg-surface">
              {hashes.map(({ name, value }, index) => (
                <button
                  type="button"
                  key={name}
                  className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted ${index < hashes.length - 1 ? 'border-b border-edge' : ''}`}
                  onClick={() => { void copyText(value, `${name} copied`); }}
                  aria-label={`Copy ${name} hash`}
                >
                  <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wider text-ink-3">{name}</span>
                  <code className="flex-1 truncate font-mono text-xs text-ink-2">{value}</code>
                  <span className="shrink-0 text-xs font-semibold text-accent">Copy</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-3">Hashes update as you type.</p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {!file ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                chooseFile(event.dataTransfer.files[0] ?? null);
              }}
              className={`flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${dragging ? 'border-accent bg-accent-subtle' : 'border-edge hover:border-edge-strong'}`}
            >
              <FileUp aria-hidden="true" className="h-8 w-8 text-ink-3" strokeWidth={1.5} />
              <span>
                <span className="block text-sm font-semibold text-ink">Choose a file</span>
                <span className="mt-1 block text-xs text-ink-3">or drop it here, up to {MAX_HASH_FILE_SIZE / 1024 / 1024} MB</span>
              </span>
            </button>
          ) : (
            <div className="rounded-xl border border-edge bg-surface p-4">
              <div className="flex items-center gap-3">
                <FileCheck2 aria-hidden="true" className="h-5 w-5 shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{file.name}</p>
                  <p className="text-xs text-ink-3">{formatBytes(file.size)} · kept in this tab only</p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={clearFile}
                  disabled={processing}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)]"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            hidden
            type="file"
            onChange={(event) => {
              chooseFile(event.target.files?.[0] ?? null);
              event.currentTarget.value = '';
            }}
          />

          {file ? (
            <div className="grid gap-4 rounded-xl border border-edge bg-surface p-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="file-hash-algorithm" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Algorithm</label>
                <select
                  id="file-hash-algorithm"
                  value={fileAlgorithm}
                  onChange={(event) => {
                    setFileAlgorithm(event.target.value as HashAlgorithmName);
                    resetFileResult();
                  }}
                  className="h-11 rounded-md border border-edge bg-canvas px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas"
                >
                  {HASH_ALGORITHMS.map(({ name, legacy }) => (
                    <option key={name} value={name}>{name}{legacy ? ' (legacy)' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="expected-file-hash" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Expected checksum (optional)</label>
                <input
                  id="expected-file-hash"
                  value={expectedHash}
                  onChange={(event) => setExpectedHash(event.target.value)}
                  aria-invalid={expectedError ? true : undefined}
                  aria-describedby={expectedError ? 'expected-file-hash-error' : undefined}
                  placeholder="Paste a checksum to verify"
                  spellCheck={false}
                  className={`h-11 rounded-md border bg-canvas px-3 font-mono text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas ${expectedError ? 'border-red-500/70' : 'border-edge'}`}
                />
              </div>
              {expectedError ? (
                <p id="expected-file-hash-error" role="alert" className="text-xs font-medium text-red-600 dark:text-red-400 sm:col-start-2">{expectedError}</p>
              ) : null}
              <button
                type="button"
                onClick={hashFile}
                disabled={processing}
                aria-busy={processing}
                className="h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:col-span-2"
              >
                {processing ? `Calculating ${fileAlgorithm}…` : `Calculate ${fileAlgorithm}`}
              </button>
              {processing ? (
                <button
                  type="button"
                  onClick={resetFileResult}
                  className="min-h-11 text-sm font-semibold text-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] sm:col-span-2"
                >
                  Stop waiting for this result
                </button>
              ) : null}
            </div>
          ) : null}

          {fileHash && file ? (
            <div className="rounded-xl border border-edge bg-surface p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">{fileAlgorithm} checksum</p>
                  <p role="status" className={`text-sm font-semibold empty:hidden ${comparison ? 'mt-1 text-green-700 dark:text-green-400' : 'mt-1 text-red-600 dark:text-red-400'}`}>
                    {comparison === null ? null : comparison ? 'Checksum matches' : 'Checksum does not match'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { void copyText(fileHash, `${fileAlgorithm} copied`); }}
                    className="h-11 rounded-md border border-edge px-3 text-xs font-semibold text-ink hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] fine-pointer:h-9"
                  >
                    Copy
                  </button>
                  <a
                    href={checksumDownload}
                    download={`${file.name}.${fileAlgorithm.toLowerCase().replace('-', '')}`}
                    className="inline-flex h-11 items-center rounded-md bg-accent px-3 text-xs font-semibold text-accent-fg hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] fine-pointer:h-9"
                  >
                    Download
                  </a>
                </div>
              </div>
              <code className="block break-all rounded-md bg-muted p-3 font-mono text-xs leading-relaxed text-ink">{fileHash}</code>
              {expectedHash.trim() && !expectedError ? (
                <p className="sr-only">Expected checksum: {normalizeExpectedHash(expectedHash)}</p>
              ) : null}
            </div>
          ) : null}

          <p className="text-xs leading-relaxed text-ink-3">
            SHA-1 is provided for legacy checks only. Do not use raw hashes for password storage.
          </p>
        </div>
      )}
    </ToolPage>
  );
}
