'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FilePlus2, X, FileText } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import { ToolProgress } from '@/components/tools/ToolProgress';
import {
  MAX_PDF_FILES,
  MAX_PDF_SIZE,
  MAX_PDF_TOTAL_SIZE,
  validatePdfCollection,
  validatePdfFile,
} from '@/lib/pdf-utils';

type PdfMergeProgress = {
  label: string;
  progress: number;
};

type PdfWorkerResponse =
  | { status: 'progress'; label: string; progress: number }
  | { status: 'done'; blob: Blob }
  | { status: 'error'; error: string };

const PDF_FILE_SIZE_LABEL = `${MAX_PDF_SIZE / 1024 / 1024} MB`;
const PDF_TOTAL_SIZE_LABEL = `${MAX_PDF_TOTAL_SIZE / 1024 / 1024} MB`;

function collectionError(files: readonly File[]): string | null {
  const validation = validatePdfCollection(files);
  if (validation === 'too-many') return `Choose no more than ${MAX_PDF_FILES} PDF files`;
  if (validation === 'total-too-large') return `Keep the total PDF size at ${PDF_TOTAL_SIZE_LABEL} or less`;
  return null;
}

export default function PdfMergeComponent() {
  const [files, setFiles]             = useState<File[]>([]);
  const [mergedUrl, setMergedUrl]     = useState<string | null>(null);
  const [processing, setProcessing]   = useState(false);
  const [mergeProgress, setMergeProgress] = useState<PdfMergeProgress | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const cancelMerge = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setProcessing(false);
    setMergeProgress(null);
  };

  useEffect(() => {
    return () => {
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
    };
  }, [mergedUrl]);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const addFiles = (incoming: FileList | File[]) => {
    if (processing) {
      toast.error('Cancel the current merge before changing files');
      return;
    }

    const incomingFiles = Array.from(incoming);
    const nonPdfs = incomingFiles.filter((file) => validatePdfFile(file) === 'not-pdf');
    const oversized = incomingFiles.filter((file) => validatePdfFile(file) === 'too-large');
    const pdfs = incomingFiles.filter((file) => validatePdfFile(file) === 'ok');
    if (nonPdfs.length > 0) toast.error('PDF files only');
    if (oversized.length > 0) toast.error(`Each PDF must be ${PDF_FILE_SIZE_LABEL} or smaller`);
    if (pdfs.length === 0) return;
    const nextFiles = [...files, ...pdfs];
    const limitError = collectionError(nextFiles);
    if (limitError) {
      toast.error(limitError);
      return;
    }
    setFiles(nextFiles);
    setMergedUrl(null);
  };

  const clearFiles = () => {
    cancelMerge();
    setFiles([]);
    setMergedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    if (processing) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedUrl(null);
  };

  const completeMerge = (blob: Blob) => {
    setMergedUrl(URL.createObjectURL(blob));
    setMergeProgress({ label: 'Ready', progress: 100 });
    setProcessing(false);
    toast.success('Merged successfully');
  };

  const mergeOnMainThread = async () => {
    try {
      const { PDFDocument } = await import('pdf-lib');
      const merged = await PDFDocument.create();
      for (const [index, file] of files.entries()) {
        setMergeProgress({
          label: `Reading ${index + 1} of ${files.length}`,
          progress: Math.round((index / files.length) * 80),
        });
        const buf = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buf);
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      setMergeProgress({ label: 'Saving merged PDF', progress: 95 });
      const bytes = await merged.save();
      const blob  = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      completeMerge(blob);
    } catch {
      setProcessing(false);
      setMergeProgress(null);
      toast.error('Merge failed. Make sure every file is a valid PDF');
    }
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    if (files.some((file) => validatePdfFile(file) !== 'ok')) {
      toast.error(`Every PDF must be valid and ${PDF_FILE_SIZE_LABEL} or smaller`);
      return;
    }
    const limitError = collectionError(files);
    if (limitError) {
      toast.error(limitError);
      return;
    }
    setProcessing(true);
    setMergedUrl(null);
    setMergeProgress({ label: 'Preparing PDFs', progress: 5 });

    if (typeof Worker === 'undefined') {
      await mergeOnMainThread();
      return;
    }

    workerRef.current?.terminate();
    const worker = new Worker(new URL('./pdf-merge.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    const failMerge = () => {
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
      setProcessing(false);
      setMergeProgress(null);
      toast.error('Merge failed. Make sure every file is a valid PDF');
    };

    worker.onmessage = (event: MessageEvent<PdfWorkerResponse>) => {
      const message = event.data;

      if (message.status === 'progress') {
        setMergeProgress({ label: message.label, progress: message.progress });
        return;
      }

      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;

      if (message.status === 'done') {
        completeMerge(message.blob);
      } else {
        failMerge();
      }
    };

    worker.onerror = failMerge;
    worker.postMessage({ files });
  };

  const totalSources = files.length;
  const totalSize  = (files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(2);

  return (
    <ToolPage
      toolId="pdf-merge"
      eyebrow="Documents"
      title="PDF Merger"
      description="Combine multiple PDF files in your browser. Nothing is uploaded."
      width="medium"
    >

      {/* Drop zone */}
      <button
        type="button"
        className={[
          'w-full rounded-xl border-2 border-dashed p-10 flex flex-col items-center gap-3 text-center transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          isDragging ? 'border-accent bg-accent/5' : 'border-edge hover:border-accent/60',
        ].join(' ')}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Choose PDF files"
      >
        <FilePlus2 aria-hidden="true" className="w-8 h-8 text-ink-3" strokeWidth={1.5} />
        <span className="block">
          <span className="block text-sm font-semibold text-ink">Choose PDF files</span>
          <span className="block text-xs text-ink-3 mt-0.5">
            or drop them here, up to {PDF_FILE_SIZE_LABEL} each · {MAX_PDF_FILES} files · {PDF_TOTAL_SIZE_LABEL} total
          </span>
        </span>
      </button>
      <input ref={fileInputRef} id="pdf-upload" name="pdf-files" type="file" multiple accept=".pdf" aria-label="Choose PDF files" tabIndex={-1} className="sr-only"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = '';
        }} />

      {/* File list */}
      {files.length > 0 && (
        <div className="rounded-xl border border-edge bg-surface overflow-hidden mb-4">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-edge bg-muted">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              {files.length} file{files.length !== 1 ? 's' : ''} · {totalSize} MB total
            </span>
            <button
              type="button"
              onClick={clearFiles}
              disabled={processing}
              className="min-h-11 rounded-sm px-2 text-xs font-semibold text-ink-3 hover:text-ink disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] fine-pointer:min-h-9"
            >
              Clear all
            </button>
          </div>
          <ul className="divide-y divide-edge max-h-56 overflow-y-auto">
            {files.map((file, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-muted border border-edge text-ink-3 rounded text-xs font-bold">
                  {i + 1}
                </span>
                <FileText aria-hidden="true" className="shrink-0 w-4 h-4 text-ink-3" strokeWidth={1.5} />
                <span className="flex-1 text-sm text-ink truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-ink-3">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  disabled={processing}
                  aria-label={`Remove ${file.name}`}
                  className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-3 hover:bg-muted hover:text-ink disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)]"
                >
                  <X aria-hidden="true" className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={mergePdfs}
          disabled={processing || files.length < 2}
          aria-busy={processing}
          className="flex-1 h-11 bg-accent text-accent-fg font-semibold rounded-xl hover:bg-accent-hover disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          {processing ? 'Merging…' : files.length < 2 ? 'Add at least 2 PDFs' : `Merge ${files.length} PDFs`}
        </button>
      </div>

      {processing && mergeProgress ? (
        <div className="mt-3">
          <ToolProgress
            label={mergeProgress.label}
            value={mergeProgress.progress}
            progressLabel="PDF merge progress"
            onCancel={cancelMerge}
          />
        </div>
      ) : null}

      {/* Download */}
      {mergedUrl && (
        <div className="mt-6 rounded-xl border border-edge bg-surface p-5 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">Merged PDF ready</p>
            <p className="text-xs text-ink-3 mt-0.5">{totalSources} source files combined</p>
          </div>
          <a
            href={mergedUrl}
            download="merged.pdf"
            className="h-11 px-4 inline-flex items-center text-sm font-semibold bg-accent text-accent-fg rounded-lg hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas fine-pointer:h-9"
          >
            Download
          </a>
        </div>
      )}
    </ToolPage>
  );
}
