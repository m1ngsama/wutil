'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FilePlus2, X, FileText } from 'lucide-react';
import { validatePdfFile } from '@/lib/pdf-utils';

type PdfMergeProgress = {
  label: string;
  progress: number;
};

type PdfWorkerResponse =
  | { status: 'progress'; label: string; progress: number }
  | { status: 'done'; blob: Blob }
  | { status: 'error'; error: string };

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
    if (oversized.length > 0) toast.error('Each PDF must be 10 MB or smaller');
    if (pdfs.length === 0) return;
    setFiles((prev) => [...prev, ...pdfs]);
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
      toast.error('Failed - ensure all files are valid PDFs');
    }
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
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
      toast.error('Failed - ensure all files are valid PDFs');
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Documents</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">PDF Merger</h1>
        <p className="text-base text-ink-2 max-w-[48ch]">Combine multiple PDF files into one — entirely in your browser, nothing uploaded.</p>
      </header>

      {/* Drop zone */}
      <button
        type="button"
        className={[
          'w-full rounded-xl border-2 border-dashed p-10 flex flex-col items-center gap-3 text-center transition-colors mb-4',
          isDragging ? 'border-accent bg-accent/5' : 'border-edge hover:border-accent/60',
        ].join(' ')}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Choose PDF files"
      >
        <FilePlus2 className="w-8 h-8 text-ink-3" strokeWidth={1.5} />
        <span className="block">
          <span className="block text-sm font-semibold text-ink">Drop PDF files here</span>
          <span className="block text-xs text-ink-3 mt-0.5">or click to browse — up to 10 MB each</span>
        </span>
      </button>
      <input ref={fileInputRef} id="pdf-upload" type="file" multiple accept=".pdf" aria-label="Choose PDF files" className="sr-only"
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
              className="text-xs font-semibold text-ink-3 hover:text-ink disabled:opacity-40 transition-colors"
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
                <FileText className="shrink-0 w-4 h-4 text-ink-3" strokeWidth={1.5} />
                <span className="flex-1 text-sm text-ink truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-ink-3">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  disabled={processing}
                  aria-label={`Remove ${file.name}`}
                  className="shrink-0 w-5 h-5 flex items-center justify-center text-ink-3 hover:text-ink disabled:opacity-40 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
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
          className="flex-1 h-11 bg-accent text-accent-fg font-semibold rounded-xl hover:bg-accent-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          {processing ? 'Merging…' : files.length < 2 ? 'Add at least 2 PDFs' : `Merge ${files.length} PDFs`}
        </button>
      </div>

      {processing && mergeProgress && (
        <div className="mt-3 rounded-xl border border-edge bg-muted p-3" aria-live="polite">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              {mergeProgress.label}
            </span>
            <button
              type="button"
              onClick={cancelMerge}
              className="text-xs font-semibold text-ink-3 hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
          <div
            role="progressbar"
            aria-label="PDF merge progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={mergeProgress.progress}
            className="h-1.5 rounded-full bg-surface border border-edge overflow-hidden"
          >
            <div
              className="h-full bg-accent transition-[width] duration-200"
              style={{ width: `${mergeProgress.progress}%` }}
            />
          </div>
        </div>
      )}

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
            className="h-9 px-4 inline-flex items-center text-sm font-semibold bg-accent text-accent-fg rounded-lg hover:bg-accent-hover transition-colors"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}
