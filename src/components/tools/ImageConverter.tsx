'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef, useCallback, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { ImageIcon, Lock, Unlock } from 'lucide-react';

const FORMATS = [
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { value: 'image/png',  label: 'PNG',  ext: 'png' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
];

type ImageConversionStage = 'decoding' | 'drawing' | 'encoding';

type ImageWorkerResponse =
  | { status: 'progress'; stage: ImageConversionStage; progress: number }
  | { status: 'done'; blob: Blob; size: number }
  | { status: 'error'; error: string };

const STAGE_LABELS: Record<ImageConversionStage, string> = {
  decoding: 'Decoding image',
  drawing: 'Resizing image',
  encoding: 'Encoding output',
};

function fmtBytes(n: number) {
  if (n < 1024)       return n + ' B';
  if (n < 1048576)    return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(2) + ' MB';
}

function parseDimensionInput(value: string): number | '' {
  if (value === '') return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return Math.max(1, Math.round(n));
}

function isSvgFile(file: File) {
  return file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
}

export default function ImageConverterComponent() {
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [origW, setOrigW]               = useState(0);
  const [origH, setOrigH]               = useState(0);
  const [width, setWidth]               = useState<number | ''>('');
  const [height, setHeight]             = useState<number | ''>('');
  const [lockAspect, setLockAspect]     = useState(true);
  const [format, setFormat]             = useState('image/jpeg');
  const [quality, setQuality]           = useState(0.85);
  const [processing, setProcessing]     = useState(false);
  const [conversionStatus, setConversionStatus] = useState('');
  const [conversionProgress, setConversionProgress] = useState(0);
  const [resultUrl, setResultUrl]       = useState<string | null>(null);
  const [resultSize, setResultSize]     = useState(0);
  const [isDragging, setIsDragging]     = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const stopActiveConversion = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setProcessing(false);
    setConversionStatus('');
    setConversionProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    stopActiveConversion();
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setPreviewUrl(url);
    setResultUrl(null);
    const img = new Image();
    img.onload = () => {
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.onerror = () => toast.error('Could not load that image');
    img.src = url;
  }, [stopActiveConversion]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) loadFile(e.target.files[0]);
    e.target.value = '';
  };

  const onWidthChange = (v: number | '') => {
    setWidth(v);
    if (lockAspect && origW && origH && v !== '') {
      setHeight(Math.round((Number(v) / origW) * origH));
    }
  };
  const onHeightChange = (v: number | '') => {
    setHeight(v);
    if (lockAspect && origW && origH && v !== '') {
      setWidth(Math.round((Number(v) / origH) * origW));
    }
  };

  const completeConversion = (blob: Blob) => {
    setResultUrl(URL.createObjectURL(blob));
    setResultSize(blob.size);
    setConversionProgress(100);
    setConversionStatus('Ready');
    setProcessing(false);
    toast.success('Converted');
  };

  const convertOnMainThread = (w: number, h: number) => {
    if (!previewUrl || !canvasRef.current) {
      toast.error('Conversion failed');
      setProcessing(false);
      return;
    }

    setConversionStatus('Rasterizing image');
    setConversionProgress(45);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx    = canvas.getContext('2d')!;

      canvas.width  = w;
      canvas.height = h;
      // White background for JPEG transparency.
      if (format === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(img, 0, 0, w, h);

      setConversionStatus('Encoding output');
      setConversionProgress(85);
      canvas.toBlob(
        (blob) => {
          if (!blob) { toast.error('Conversion failed'); setProcessing(false); return; }
          completeConversion(blob);
        },
        format,
        format === 'image/png' ? undefined : quality,
      );
    };
    img.onerror = () => {
      toast.error('Conversion failed');
      setProcessing(false);
    };
    img.src = previewUrl;
  };

  const convertInWorker = (w: number, h: number) => {
    if (!imageFile) return;

    workerRef.current?.terminate();
    const worker = new Worker(new URL('./image-converter.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    const fallBackToMainThread = () => {
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
      setConversionStatus('Retrying in browser');
      setConversionProgress(25);
      convertOnMainThread(w, h);
    };

    worker.onmessage = (event: MessageEvent<ImageWorkerResponse>) => {
      const message = event.data;

      if (message.status === 'progress') {
        setConversionStatus(STAGE_LABELS[message.stage]);
        setConversionProgress(message.progress);
        return;
      }

      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;

      if (message.status === 'done') {
        completeConversion(message.blob);
      } else {
        fallBackToMainThread();
      }
    };

    worker.onerror = fallBackToMainThread;
    worker.postMessage({ file: imageFile, width: w, height: h, format, quality });
  };

  const convert = () => {
    if (!imageFile || !canvasRef.current) return;
    setProcessing(true);
    setConversionStatus('Preparing image');
    setConversionProgress(5);
    setResultUrl(null);

    const w = Number(width)  || origW;
    const h = Number(height) || origH;
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
      toast.error('Width and height must be at least 1 px');
      setProcessing(false);
      return;
    }

    const canUseWorker =
      !isSvgFile(imageFile) &&
      typeof Worker !== 'undefined' &&
      typeof OffscreenCanvas !== 'undefined' &&
      typeof createImageBitmap !== 'undefined';

    if (canUseWorker) {
      convertInWorker(w, h);
    } else {
      convertOnMainThread(w, h);
    }
  };

  const ext = FORMATS.find((f) => f.value === format)?.ext ?? 'jpg';
  const ratio = origW && origH ? `${origW} × ${origH}` : '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Images</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">Image Converter</h1>
        <p className="text-base text-ink-2 max-w-[50ch]">Convert, resize, and compress images to JPEG, PNG, or WebP — all in your browser.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Upload */}
          <button
            type="button"
            className={[
              'w-full rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-3 text-center transition-colors',
              isDragging ? 'border-accent bg-accent/5' : 'border-edge hover:border-accent/60',
            ].join(' ')}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Choose an image file"
          >
            <ImageIcon className="w-7 h-7 text-ink-3" strokeWidth={1.5} />
            <span className="block">
              <span className="block text-sm font-semibold text-ink">Drop an image here</span>
              <span className="block text-xs text-ink-3 mt-0.5">or click to browse</span>
            </span>
            {imageFile && (
              <span className="text-xs text-ink-2 bg-muted border border-edge rounded-md px-3 py-1.5">
                {imageFile.name} · {fmtBytes(imageFile.size)} · {ratio}
              </span>
            )}
          </button>
          <input ref={fileInputRef} id="img-upload" type="file" accept="image/*" aria-label="Choose image file" className="sr-only" onChange={handleFileChange} />

          {/* Format */}
          <div className="rounded-xl border border-edge bg-surface p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-3 mb-2">Output format</p>
              <div className="flex rounded-md border border-edge overflow-hidden">
                {FORMATS.map((f) => (
                  <button
                    type="button"
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      format === f.value ? 'bg-accent text-accent-fg' : 'bg-surface text-ink hover:bg-muted'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {format !== 'image/png' && (
              <div>
                <div className="flex justify-between mb-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Quality</p>
                  <span className="text-sm font-bold text-accent">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range" min={0.1} max={1} step={0.05} value={quality}
                  aria-label="Image quality"
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-[var(--w-accent)]"
                />
                <div className="flex justify-between text-xs text-ink-3 mt-0.5"><span>Low</span><span>Max</span></div>
              </div>
            )}

            {/* Dimensions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Dimensions (px)</p>
                <button
                  type="button"
                  onClick={() => setLockAspect((l) => !l)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-ink-3 hover:text-ink transition-colors"
                  title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                >
                  {lockAspect
                    ? <Lock className="w-3.5 h-3.5" />
                    : <Unlock className="w-3.5 h-3.5" />}
                  {lockAspect ? 'Locked' : 'Free'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'W', value: width,  onChange: onWidthChange  },
                  { label: 'H', value: height, onChange: onHeightChange },
                ].map(({ label, value, onChange }) => (
                  <div key={label}>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1">{label}</label>
                    <input
                      type="number" min={1} value={value}
                      aria-label={label === 'W' ? 'Output width' : 'Output height'}
                      onChange={(e) => onChange(parseDimensionInput(e.target.value))}
                      className="w-full font-mono text-sm text-ink bg-muted border border-edge rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)]"
                    />
                  </div>
                ))}
              </div>
              {origW > 0 && (
                <button
                  type="button"
                  onClick={() => { setWidth(origW); setHeight(origH); }}
                  className="mt-2 text-xs font-semibold text-accent hover:underline underline-offset-4"
                >
                  Reset to original ({origW} × {origH})
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={convert}
            disabled={!imageFile || processing}
            className="w-full h-11 bg-accent text-accent-fg font-semibold rounded-xl hover:bg-accent-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            {processing ? 'Converting…' : 'Convert Image'}
          </button>

          {processing && (
            <div className="rounded-xl border border-edge bg-muted p-3" aria-live="polite">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                  {conversionStatus || 'Converting image'}
                </span>
                <button
                  type="button"
                  onClick={stopActiveConversion}
                  className="text-xs font-semibold text-ink-3 hover:text-ink transition-colors"
                >
                  Cancel
                </button>
              </div>
              <div
                role="progressbar"
                aria-label="Image conversion progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={conversionProgress}
                className="h-1.5 rounded-full bg-surface border border-edge overflow-hidden"
              >
                <div
                  className="h-full bg-accent transition-[width] duration-200"
                  style={{ width: `${conversionProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-edge bg-surface overflow-hidden flex flex-col">
          <div className="border-b border-edge px-4 py-2.5 flex items-center justify-between bg-muted">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              {resultUrl ? 'Result' : 'Preview'}
            </span>
            {resultUrl && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-ink-3">{fmtBytes(resultSize)}</span>
                <a
                  href={resultUrl}
                  download={`converted.${ext}`}
                  className="h-7 px-3 inline-flex items-center text-xs font-semibold bg-accent text-accent-fg rounded-md hover:bg-accent-hover transition-colors"
                >
                  Download
                </a>
              </div>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center p-4 min-h-[360px]">
            {resultUrl ? (
              <img src={resultUrl} alt="Converted" className="max-w-full max-h-[500px] rounded object-contain" />
            ) : previewUrl ? (
              <img src={previewUrl} alt="Original" className="max-w-full max-h-[500px] rounded object-contain opacity-70" />
            ) : (
              <div className="text-center text-ink-3">
                <ImageIcon className="mx-auto w-10 h-10 mb-2" strokeWidth={1} />
                <p className="text-sm">No image loaded</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
