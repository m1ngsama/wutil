'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef, useCallback, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { ImageIcon, Lock, Unlock } from 'lucide-react';
import { ToolPage } from '@/components/tools/ToolPage';
import { ToolProgress } from '@/components/tools/ToolProgress';
import {
  fitImageWithinOutputLimits,
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_FILE_SIZE,
  MAX_IMAGE_OUTPUT_PIXELS,
  MAX_IMAGE_SOURCE_PIXELS,
  validateImageDimensions,
  validateImageFile,
} from '@/lib/image-utils';

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

const INTEGER_FORMATTER = new Intl.NumberFormat('en-US');
const MAX_IMAGE_FILE_SIZE_LABEL = `${MAX_IMAGE_FILE_SIZE / 1024 / 1024} MB`;

function fmtBytes(n: number) {
  if (n < 1024)       return n + ' B';
  if (n < 1048576)    return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(2) + ' MB';
}

function fmtInteger(n: number) {
  return INTEGER_FORMATTER.format(n);
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
  const fileLoadIdRef = useRef(0);
  const conversionIdRef = useRef(0);

  const clearResult = useCallback(() => {
    setResultUrl(null);
    setResultSize(0);
  }, []);

  const stopActiveConversion = useCallback(() => {
    conversionIdRef.current += 1;
    workerRef.current?.terminate();
    workerRef.current = null;
    setProcessing(false);
    setConversionStatus('');
    setConversionProgress(0);
  }, []);

  const invalidateOutput = useCallback(() => {
    stopActiveConversion();
    clearResult();
  }, [clearResult, stopActiveConversion]);

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
      fileLoadIdRef.current += 1;
      conversionIdRef.current += 1;
      workerRef.current?.terminate();
    };
  }, []);

  const loadFile = useCallback((file: File) => {
    const loadId = ++fileLoadIdRef.current;
    const fileValidation = validateImageFile(file);
    if (fileValidation === 'not-image') {
      toast.error('Choose an image file');
      return;
    }
    if (fileValidation === 'too-large') {
      toast.error(`Choose an image smaller than ${MAX_IMAGE_FILE_SIZE_LABEL}`);
      return;
    }

    stopActiveConversion();
    clearResult();
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (fileLoadIdRef.current !== loadId) {
        URL.revokeObjectURL(url);
        return;
      }

      const sourceValidation = validateImageDimensions(
        img.naturalWidth,
        img.naturalHeight,
        MAX_IMAGE_SOURCE_PIXELS,
      );
      if (sourceValidation !== 'ok') {
        URL.revokeObjectURL(url);
        toast.error(`Choose an image under ${fmtInteger(MAX_IMAGE_DIMENSION)} px per side and 64 MP`);
        return;
      }

      const safeOutput = fitImageWithinOutputLimits(img.naturalWidth, img.naturalHeight);
      setImageFile(file);
      setPreviewUrl(url);
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
      setWidth(safeOutput.width);
      setHeight(safeOutput.height);

      if (safeOutput.width !== img.naturalWidth || safeOutput.height !== img.naturalHeight) {
        toast.info(`Output set to ${fmtInteger(safeOutput.width)} × ${fmtInteger(safeOutput.height)} for browser stability`);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      if (fileLoadIdRef.current !== loadId) return;
      toast.error('Could not load that image');
    };
    img.src = url;
  }, [clearResult, stopActiveConversion]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) loadFile(e.target.files[0]);
    e.target.value = '';
  };

  const onWidthChange = (v: number | '') => {
    invalidateOutput();
    setWidth(v);
    if (lockAspect && origW && origH && v !== '') {
      setHeight(Math.round((Number(v) / origW) * origH));
    }
  };
  const onHeightChange = (v: number | '') => {
    invalidateOutput();
    setHeight(v);
    if (lockAspect && origW && origH && v !== '') {
      setWidth(Math.round((Number(v) / origH) * origW));
    }
  };

  const completeConversion = (blob: Blob, conversionId: number) => {
    if (conversionIdRef.current !== conversionId) return;
    setResultUrl(URL.createObjectURL(blob));
    setResultSize(blob.size);
    setConversionProgress(100);
    setConversionStatus('Ready');
    setProcessing(false);
    toast.success('Converted');
  };

  const convertOnMainThread = (w: number, h: number, conversionId: number) => {
    if (conversionIdRef.current !== conversionId) return;
    if (!previewUrl || !canvasRef.current) {
      toast.error('Conversion failed');
      setProcessing(false);
      return;
    }

    setConversionStatus('Rasterizing image');
    setConversionProgress(45);

    const img = new Image();
    img.onload = () => {
      if (conversionIdRef.current !== conversionId) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        toast.error('Conversion failed');
        setProcessing(false);
        return;
      }

      try {
        canvas.width  = w;
        canvas.height = h;
        // White background for JPEG transparency.
        if (format === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
        ctx.drawImage(img, 0, 0, w, h);
      } catch {
        toast.error('Conversion failed');
        setProcessing(false);
        return;
      }

      setConversionStatus('Encoding output');
      setConversionProgress(85);
      canvas.toBlob(
        (blob) => {
          if (conversionIdRef.current !== conversionId) return;
          if (!blob) { toast.error('Conversion failed'); setProcessing(false); return; }
          completeConversion(blob, conversionId);
        },
        format,
        format === 'image/png' ? undefined : quality,
      );
    };
    img.onerror = () => {
      if (conversionIdRef.current !== conversionId) return;
      toast.error('Conversion failed');
      setProcessing(false);
    };
    img.src = previewUrl;
  };

  const convertInWorker = (w: number, h: number, conversionId: number) => {
    if (!imageFile) return;

    workerRef.current?.terminate();
    const worker = new Worker(new URL('./image-converter.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    const fallBackToMainThread = () => {
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
      if (conversionIdRef.current !== conversionId) return;
      setConversionStatus('Retrying in browser');
      setConversionProgress(25);
      convertOnMainThread(w, h, conversionId);
    };

    worker.onmessage = (event: MessageEvent<ImageWorkerResponse>) => {
      const message = event.data;
      if (conversionIdRef.current !== conversionId) {
        worker.terminate();
        if (workerRef.current === worker) workerRef.current = null;
        return;
      }

      if (message.status === 'progress') {
        setConversionStatus(STAGE_LABELS[message.stage]);
        setConversionProgress(message.progress);
        return;
      }

      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;

      if (message.status === 'done') {
        completeConversion(message.blob, conversionId);
      } else {
        fallBackToMainThread();
      }
    };

    worker.onerror = fallBackToMainThread;
    worker.postMessage({ file: imageFile, width: w, height: h, format, quality });
  };

  const convert = () => {
    if (!imageFile || !canvasRef.current) return;
    const w = Number(width)  || origW;
    const h = Number(height) || origH;
    const dimensionValidation = validateImageDimensions(w, h);
    if (dimensionValidation === 'invalid') {
      toast.error('Width and height must be at least 1 px');
      return;
    }
    if (dimensionValidation === 'too-large') {
      toast.error(`Keep output under ${fmtInteger(MAX_IMAGE_DIMENSION)} px per side and 40 MP`);
      return;
    }

    setProcessing(true);
    setConversionStatus('Preparing image');
    setConversionProgress(5);
    clearResult();
    workerRef.current?.terminate();
    workerRef.current = null;
    const conversionId = ++conversionIdRef.current;

    const canUseWorker =
      !isSvgFile(imageFile) &&
      typeof Worker !== 'undefined' &&
      typeof OffscreenCanvas !== 'undefined' &&
      typeof createImageBitmap !== 'undefined';

    if (canUseWorker) {
      convertInWorker(w, h, conversionId);
    } else {
      convertOnMainThread(w, h, conversionId);
    }
  };

  const ext = FORMATS.find((f) => f.value === format)?.ext ?? 'jpg';
  const ratio = origW && origH ? `${origW} × ${origH}` : '';
  const resetDimensions = fitImageWithinOutputLimits(origW, origH);
  const needsSafeOutput = resetDimensions.width !== origW || resetDimensions.height !== origH;

  return (
    <ToolPage
      toolId="image-converter"
      eyebrow="Images"
      title="Image Converter"
      description="Convert, resize, and compress images to JPEG, PNG, or WebP. Everything stays in your browser."
      width="xwide"
    >

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Upload */}
          <button
            type="button"
            className={[
              'w-full rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
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
            <ImageIcon aria-hidden="true" className="w-7 h-7 text-ink-3" strokeWidth={1.5} />
            <span className="block">
              <span className="block text-sm font-semibold text-ink">Choose an image</span>
              <span className="block text-xs text-ink-3 mt-0.5"><span className="hidden fine-pointer:inline">or drop one here. </span>Up to {MAX_IMAGE_FILE_SIZE_LABEL}</span>
            </span>
            {imageFile && (
              <span className="text-xs text-ink-2 bg-muted border border-edge rounded-md px-3 py-1.5">
                {imageFile.name} · {fmtBytes(imageFile.size)} · {ratio}
              </span>
            )}
          </button>
          <input ref={fileInputRef} id="img-upload" name="image-file" type="file" accept="image/*" aria-label="Choose image file" tabIndex={-1} className="sr-only" onChange={handleFileChange} />

          {/* Format */}
          <div className="rounded-xl border border-edge bg-surface p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-3 mb-2">Output format</p>
              <div className="flex rounded-md border border-edge overflow-hidden">
                {FORMATS.map((f) => (
                  <button
                    type="button"
                    key={f.value}
                    onClick={() => {
                      if (f.value === format) return;
                      invalidateOutput();
                      setFormat(f.value);
                    }}
                    aria-pressed={format === f.value}
                    className={`min-h-11 flex-1 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--w-ring)] ${
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
                  onChange={(e) => {
                    invalidateOutput();
                    setQuality(parseFloat(e.target.value));
                  }}
                  className="h-11 w-full accent-[var(--w-accent)]"
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
                  aria-pressed={lockAspect}
                  className="flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-xs font-semibold text-ink-3 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] fine-pointer:min-h-9"
                  title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                >
                  {lockAspect
                    ? <Lock aria-hidden="true" className="w-3.5 h-3.5" />
                    : <Unlock aria-hidden="true" className="w-3.5 h-3.5" />}
                  {lockAspect ? 'Locked' : 'Free'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="image-output-width" className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1">W</label>
                  <input
                    id="image-output-width"
                    type="number" min={1} value={width}
                    aria-label="Output width"
                    aria-describedby="image-dimension-limit"
                    onChange={(e) => onWidthChange(parseDimensionInput(e.target.value))}
                    className="h-11 w-full font-mono text-sm text-ink bg-muted border border-edge rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas"
                  />
                </div>
                <div>
                  <label htmlFor="image-output-height" className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1">H</label>
                  <input
                    id="image-output-height"
                    type="number" min={1} value={height}
                    aria-label="Output height"
                    aria-describedby="image-dimension-limit"
                    onChange={(e) => onHeightChange(parseDimensionInput(e.target.value))}
                    className="h-11 w-full font-mono text-sm text-ink bg-muted border border-edge rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas"
                  />
                </div>
              </div>
              <p id="image-dimension-limit" className="mt-2 text-xs leading-relaxed text-ink-3">
                Maximum output: {fmtInteger(MAX_IMAGE_DIMENSION)} px per side, {MAX_IMAGE_OUTPUT_PIXELS / 1_000_000} MP.
              </p>
              {origW > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    invalidateOutput();
                    setWidth(resetDimensions.width);
                    setHeight(resetDimensions.height);
                  }}
                  className="mt-2 min-h-11 rounded-sm px-2 text-xs font-semibold text-accent hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] fine-pointer:min-h-9"
                >
                  {needsSafeOutput ? 'Reset to safe size' : 'Reset to original'} ({resetDimensions.width} × {resetDimensions.height})
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={convert}
            disabled={!imageFile || processing}
            aria-busy={processing}
            className="w-full h-11 bg-accent text-accent-fg font-semibold rounded-xl hover:bg-accent-hover disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            {processing ? 'Converting…' : 'Convert Image'}
          </button>

          {processing ? (
            <ToolProgress
              label={conversionStatus || 'Converting image'}
              value={conversionProgress}
              progressLabel="Image conversion progress"
              onCancel={stopActiveConversion}
            />
          ) : null}
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
                  className="h-11 px-3 inline-flex items-center text-xs font-semibold bg-accent text-accent-fg rounded-md hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas fine-pointer:h-9"
                >
                  Download
                </a>
              </div>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center p-4 min-h-[360px]">
            {resultUrl ? (
              <img
                src={resultUrl}
                alt="Converted"
                width={Number(width) || origW}
                height={Number(height) || origH}
                className="max-w-full max-h-[500px] rounded object-contain"
              />
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Original"
                width={origW}
                height={origH}
                className="max-w-full max-h-[500px] rounded object-contain opacity-70"
              />
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
    </ToolPage>
  );
}
