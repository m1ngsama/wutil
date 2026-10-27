'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDownOutline, ArrowUpOutline, DownloadOutline, AddCircleOutline, CloseOutline } from '@/components/ui/icons';
import { Button } from '@/components/ui/Button';
import { ToolPage } from '@/components/tools/ToolPage';
import { ToolProgress } from '@/components/tools/ToolProgress';
import {
  MAX_PDF_FILES,
  MAX_PDF_SIZE,
  MAX_PDF_TOTAL_SIZE,
  validatePdfCollection,
  validatePdfFile,
} from '@/lib/pdf-utils';
import { formatBytes } from '@/lib/utils';

type PdfEntry = { id: number; file: File };
type PdfResult = { url: string; size: number; fileCount: number };
type PdfMergeProgress = { label: string; progress: number };
type QueueAction = 'up' | 'down' | 'remove';

type PdfWorkerResponse =
  | { status: 'progress'; label: string; progress: number }
  | { status: 'done'; blob: Blob }
  | { status: 'error'; error: string };

const PDF_FILE_SIZE_LABEL = formatBytes(MAX_PDF_SIZE);
const PDF_TOTAL_SIZE_LABEL = formatBytes(MAX_PDF_TOTAL_SIZE);

function collectionError(files: readonly File[]): string | null {
  const validation = validatePdfCollection(files);
  if (validation === 'too-many') return `Choose no more than ${MAX_PDF_FILES} PDF files`;
  if (validation === 'total-too-large') return `Keep the total PDF size at ${PDF_TOTAL_SIZE_LABEL} or less`;
  return null;
}

export default function PdfMergeComponent() {
  const [entries, setEntries] = useState<PdfEntry[]>([]);
  const [result, setResult] = useState<PdfResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [mergeProgress, setMergeProgress] = useState<PdfMergeProgress | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const rowRefs = useRef(new Map<number, HTMLLIElement>());
  const pendingFocusRef = useRef<{ id: number; action: QueueAction } | 'upload' | null>(null);
  const nextEntryIdRef = useRef(0);
  const workerRef = useRef<Worker | null>(null);
  const operationIdRef = useRef(0);
  const processingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  useEffect(() => {
    return () => {
      operationIdRef.current += 1;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const target = pendingFocusRef.current;
    if (!target) return;
    pendingFocusRef.current = null;
    if (target === 'upload') {
      uploadButtonRef.current?.focus();
      return;
    }
    const row = rowRefs.current.get(target.id);
    const control = row?.querySelector<HTMLButtonElement>(`[data-queue-action="${target.action}"]`);
    if (control && !control.disabled) control.focus();
    else row?.focus();
  }, [entries]);

  const stopActiveMerge = () => {
    operationIdRef.current += 1;
    workerRef.current?.terminate();
    workerRef.current = null;
    processingRef.current = false;
    setProcessing(false);
    setMergeProgress(null);
  };

  const invalidateOutput = () => {
    stopActiveMerge();
    setResult(null);
    setError('');
    setStatus('');
  };

  const cancelMerge = () => {
    stopActiveMerge();
    setStatus('Merge canceled. Your files are still in the queue.');
  };

  const addFiles = (incoming: FileList | File[]) => {
    if (processingRef.current) return;
    const pdfs: File[] = [];
    const errors = new Set<string>();
    for (const file of Array.from(incoming)) {
      const validation = validatePdfFile(file);
      if (validation === 'not-pdf') errors.add('PDF files only.');
      else if (validation === 'too-large') errors.add(`Each PDF must be ${PDF_FILE_SIZE_LABEL} or smaller.`);
      else pdfs.push(file);
    }
    if (pdfs.length === 0) {
      if (errors.size) setError([...errors].join(' '));
      return;
    }
    const limitError = collectionError([...entries.map(({ file }) => file), ...pdfs]);
    if (limitError) {
      setError(limitError);
      return;
    }
    invalidateOutput();
    setEntries([...entries, ...pdfs.map((file) => ({ id: ++nextEntryIdRef.current, file }))]);
    setError([...errors].join(' '));
    setAnnouncement(`${pdfs.length} PDF${pdfs.length === 1 ? '' : 's'} added to the queue.`);
  };

  const clearFiles = () => {
    if (processingRef.current) return;
    invalidateOutput();
    setEntries([]);
    pendingFocusRef.current = 'upload';
    setAnnouncement('All files removed.');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const moveFile = (id: number, direction: -1 | 1) => {
    if (processingRef.current) return;
    const index = entries.findIndex((entry) => entry.id === id);
    const destination = index + direction;
    if (index < 0 || destination < 0 || destination >= entries.length) return;
    const nextEntries = [...entries];
    [nextEntries[index], nextEntries[destination]] = [nextEntries[destination], nextEntries[index]];
    invalidateOutput();
    pendingFocusRef.current = { id, action: direction === -1 ? 'up' : 'down' };
    setEntries(nextEntries);
    setAnnouncement(`${entries[index].file.name} moved to position ${destination + 1} of ${entries.length}.`);
  };

  const removeFile = (id: number) => {
    if (processingRef.current) return;
    const index = entries.findIndex((entry) => entry.id === id);
    if (index < 0) return;
    const nextEntries = entries.filter((entry) => entry.id !== id);
    const neighbor = nextEntries[Math.min(index, nextEntries.length - 1)];
    invalidateOutput();
    pendingFocusRef.current = neighbor ? { id: neighbor.id, action: 'remove' } : 'upload';
    setEntries(nextEntries);
    setAnnouncement(`${entries[index].file.name} removed. ${nextEntries.length} files in the queue.`);
  };

  const failMerge = (message: string, operationId: number) => {
    if (operationIdRef.current !== operationId) return;
    stopActiveMerge();
    setError(message);
  };

  const completeMerge = (blob: Blob, files: File[], operationId: number) => {
    if (operationIdRef.current !== operationId) return;
    const url = URL.createObjectURL(blob);
    stopActiveMerge();
    setResult({ url, size: blob.size, fileCount: files.length });
  };

  const mergeOnMainThread = async (files: File[], operationId: number) => {
    if (operationIdRef.current !== operationId) return;
    let activeFile = '';
    try {
      const { PDFDocument } = await import('pdf-lib');
      if (operationIdRef.current !== operationId) return;
      const merged = await PDFDocument.create();
      if (operationIdRef.current !== operationId) return;
      for (const [index, file] of files.entries()) {
        if (operationIdRef.current !== operationId) return;
        activeFile = `"${file.name}" (file ${index + 1} of ${files.length})`;
        const progressBase = Math.round((index / files.length) * 80);
        setMergeProgress({ label: `Reading ${index + 1} of ${files.length}`, progress: progressBase });
        const buffer = await file.arrayBuffer();
        if (operationIdRef.current !== operationId) return;
        const pdf = await PDFDocument.load(buffer);
        if (operationIdRef.current !== operationId) return;
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        if (operationIdRef.current !== operationId) return;
        setMergeProgress({
          label: `Adding pages from ${index + 1} of ${files.length}`,
          progress: Math.min(progressBase + 10, 90),
        });
        pages.forEach((page) => merged.addPage(page));
      }
      if (operationIdRef.current !== operationId) return;
      activeFile = '';
      setMergeProgress({ label: 'Saving merged PDF', progress: 95 });
      const bytes = await merged.save();
      if (operationIdRef.current !== operationId) return;
      completeMerge(new Blob([bytes as BlobPart], { type: 'application/pdf' }), files, operationId);
    } catch {
      failMerge(
        activeFile
          ? `Could not read ${activeFile}. Make sure it is a valid, unencrypted PDF.`
          : 'Could not merge PDFs. Make sure every file is a valid, unencrypted PDF.',
        operationId,
      );
    }
  };

  const mergePdfs = () => {
    if (processingRef.current || entries.length < 2) return;
    const files = entries.map(({ file }) => file);
    if (files.some((file) => validatePdfFile(file) !== 'ok')) {
      setError(`Every PDF must be valid and ${PDF_FILE_SIZE_LABEL} or smaller`);
      return;
    }
    const limitError = collectionError(files);
    if (limitError) {
      setError(limitError);
      return;
    }
    invalidateOutput();
    const operationId = ++operationIdRef.current;
    processingRef.current = true;
    setProcessing(true);
    setIsDragging(false);
    setMergeProgress({ label: 'Preparing PDFs', progress: 5 });
    let worker: Worker | null = null;
    let fallbackStarted = false;

    const disposeWorker = () => {
      if (!worker) return;
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
    };

    const fallBackToMainThread = () => {
      if (operationIdRef.current !== operationId || fallbackStarted) return;
      fallbackStarted = true;
      disposeWorker();
      setMergeProgress({ label: 'Preparing PDFs in browser', progress: 5 });
      void mergeOnMainThread(files, operationId);
    };

    if (typeof Worker === 'undefined') {
      fallBackToMainThread();
      return;
    }

    try {
      worker = new Worker(new URL('./pdf-merge.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<PdfWorkerResponse>) => {
        if (operationIdRef.current !== operationId || workerRef.current !== worker) return;
        const message = event.data;
        if (message.status === 'progress') {
          setMergeProgress({ label: message.label, progress: message.progress });
          return;
        }
        disposeWorker();
        if (message.status === 'done') completeMerge(message.blob, files, operationId);
        else failMerge(message.error, operationId);
      };
      worker.onerror = (event) => {
        if (operationIdRef.current !== operationId || workerRef.current !== worker) return;
        event.preventDefault();
        fallBackToMainThread();
      };
      worker.onmessageerror = () => {
        if (operationIdRef.current !== operationId || workerRef.current !== worker) return;
        fallBackToMainThread();
      };
      worker.postMessage({ files });
    } catch {
      fallBackToMainThread();
    }
  };

  const totalSize = formatBytes(entries.reduce((sum, { file }) => sum + file.size, 0));
  const nameCounts = new Map<string, number>();
  entries.forEach(({ file }) => nameCounts.set(file.name, (nameCounts.get(file.name) ?? 0) + 1));

  return (
    <ToolPage
      toolId="pdf-merge"
      description="Combine multiple PDF files in your browser."
    >
      <div className="tool-workspace pdf-workspace overflow-hidden rounded-xl border border-edge bg-surface">
        <div className={entries.length ? 'border-b border-edge' : undefined}>
          <button
            ref={uploadButtonRef}
            type="button"
            disabled={processing}
            className={[
              'group flex w-full items-center justify-center gap-x-3 gap-y-2 text-center transition-colors focus-visible:-outline-offset-2',
              entries.length ? 'flex-wrap p-4 sm:justify-start sm:p-5 sm:text-left' : 'flex-col px-4 py-8 sm:px-5 sm:py-10',
              isDragging ? 'bg-accent/5' : 'enabled:hover:bg-muted/50',
            ].join(' ')}
            onDragOver={(event) => {
              event.preventDefault();
              if (!processingRef.current) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Choose PDF files"
            aria-describedby="pdf-upload-limits"
          >
            <AddCircleOutline aria-hidden="true" className={entries.length ? 'h-5 w-5 shrink-0 text-ink-3' : 'h-8 w-8 text-ink-3'} />
            <span className="text-sm font-semibold text-ink">{entries.length ? 'Add PDF files' : 'Choose PDF files'}</span>
            <span className="text-xs text-ink-3 fine-pointer:inline hidden">or drop them here</span>
            <span id="pdf-upload-limits" className="block w-full text-xs leading-relaxed text-ink-3">
              Up to {MAX_PDF_FILES} files, {PDF_FILE_SIZE_LABEL} each and {PDF_TOTAL_SIZE_LABEL} in total.
            </span>
          </button>
          <input
            ref={fileInputRef}
            id="pdf-upload"
            name="pdf-files"
            type="file"
            multiple
            accept=".pdf"
            disabled={processing}
            aria-label="Choose PDF files"
            aria-describedby="pdf-upload-limits"
            tabIndex={-1}
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </div>

        {entries.length > 0 && (
          <section aria-labelledby="pdf-queue-title">
            <div className="flex items-center justify-between gap-3 border-b border-edge bg-muted px-4 py-2 sm:px-5">
              <div className="min-w-0">
                <h2 id="pdf-queue-title" className="text-sm font-medium text-ink-2">Merge order</h2>
                <p className="mt-0.5 text-xs text-ink-3">{entries.length} file{entries.length === 1 ? '' : 's'} · {totalSize} total</p>
              </div>
              <Button onClick={clearFiles} disabled={processing} variant="outline" size="sm">Clear all</Button>
            </div>
            <ol className="max-h-[28rem] divide-y divide-edge overflow-y-auto" aria-label="PDF file order">
              {entries.map(({ id, file }, index) => {
                const fileLabel = (nameCounts.get(file.name) ?? 0) > 1
                  ? `${file.name} (position ${index + 1} of ${entries.length})`
                  : file.name;
                return (
                  <li
                    key={id}
                    ref={(node) => {
                      if (node) rowRefs.current.set(id, node);
                      else rowRefs.current.delete(id);
                    }}
                    tabIndex={-1}
                    aria-label={`${file.name}, position ${index + 1} of ${entries.length}`}
                    className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 p-3 sm:grid-cols-[1.5rem_minmax(0,1fr)_auto] sm:px-5"
                  >
                    <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded border border-edge bg-muted text-xs font-semibold text-ink-3">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="break-all text-sm text-ink">{file.name}</p>
                      <p className="mt-0.5 text-xs text-ink-3">{formatBytes(file.size)}</p>
                    </div>
                    <div className="col-start-2 flex items-center gap-1 sm:col-start-3 sm:row-start-1">
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={processing || index === 0}
                        onClick={() => moveFile(id, -1)}
                        aria-label={`Move up ${fileLabel}`}
                        title="Move up"
                        data-queue-action="up"
                      >
                        <ArrowUpOutline aria-hidden="true" className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={processing || index === entries.length - 1}
                        onClick={() => moveFile(id, 1)}
                        aria-label={`Move down ${fileLabel}`}
                        title="Move down"
                        data-queue-action="down"
                      >
                        <ArrowDownOutline aria-hidden="true" className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={processing}
                        onClick={() => removeFile(id)}
                        aria-label={`Remove ${fileLabel}`}
                        title="Remove"
                        data-queue-action="remove"
                      >
                        <CloseOutline aria-hidden="true" className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {(entries.length > 0 || error || status) && (
          <div className="space-y-3 border-t border-edge p-4 sm:p-5">
            {error && <p role="alert" className="field-error break-words">{error}</p>}
            {status && <p role="status" className="text-sm text-ink-2">{status}</p>}
            {entries.length > 0 && !result && (
              <Button size="lg" onClick={mergePdfs} disabled={processing || entries.length < 2} aria-busy={processing} className="w-full">
                {processing ? 'Merging…' : entries.length < 2 ? 'Add at least 2 PDFs' : `Merge ${entries.length} PDFs`}
              </Button>
            )}
            {processing && mergeProgress && (
              <ToolProgress label={mergeProgress.label} value={mergeProgress.progress} progressLabel="PDF merge progress" onCancel={cancelMerge} />
            )}
            {result && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div role="status">
                  <p className="text-sm font-semibold text-ink">Merged PDF ready</p>
                  <p className="mt-0.5 text-xs text-ink-3">{result.fileCount} source files combined · {formatBytes(result.size)} output</p>
                </div>
                <a href={result.url} download="merged.pdf" className="inline-flex min-h-11 max-w-full flex-wrap items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover">
                  <DownloadOutline aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span>Download PDF</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</p>
    </ToolPage>
  );
}
