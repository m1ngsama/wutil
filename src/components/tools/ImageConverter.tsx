'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { DownloadOutline, ImageOutline, LockClosedOutline, LockOpenOutline } from '@/components/ui/icons';
import { ToolPage } from '@/components/tools/ToolPage';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
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
import { formatBytes } from '@/lib/utils';

const FORMATS = [
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
];

const PREVIEWS = [
  { value: 'original', label: 'Original' },
  { value: 'converted', label: 'Converted' },
] as const;

type ImageConversionStage = 'decoding' | 'drawing' | 'encoding';

type ImageWorkerResponse =
  | { status: 'progress'; stage: ImageConversionStage; progress: number }
  | { status: 'done'; blob: Blob; size: number }
  | { status: 'error'; error: string };

interface ImageSource {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface ImageResult {
  url: string;
  width: number;
  height: number;
  size: number;
  mime: string;
  extension: string;
}

interface ConversionSnapshot {
  source: ImageSource;
  width: number;
  height: number;
  format: string;
  quality: number;
}

const STAGE_LABELS: Record<ImageConversionStage, string> = {
  decoding: 'Decoding image',
  drawing: 'Resizing image',
  encoding: 'Encoding output',
};

const INTEGER_FORMATTER = new Intl.NumberFormat('en-US');
const MAX_IMAGE_FILE_SIZE_LABEL = `${MAX_IMAGE_FILE_SIZE / (1024 * 1024)} MiB`;

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

function formatLabel(mime: string) {
  return FORMATS.find((item) => item.value === mime)?.label ?? (mime || 'Unknown format');
}

export default function ImageConverterComponent() {
  const [source, setSource] = useState<ImageSource | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState('');
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.85);
  const [processing, setProcessing] = useState(false);
  const [conversionError, setConversionError] = useState('');
  const [conversionStatus, setConversionStatus] = useState('');
  const [conversionProgress, setConversionProgress] = useState(0);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [preview, setPreview] = useState<'original' | 'converted'>('original');
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingLoadRef = useRef<{ image: HTMLImageElement; url: string } | null>(null);
  const fileLoadIdRef = useRef(0);
  const conversionIdRef = useRef(0);
  const sourceUrl = source?.url;
  const resultUrl = result?.url;

  const clearResult = () => {
    setResult(null);
    setPreview('original');
  };

  const stopActiveConversion = () => {
    conversionIdRef.current += 1;
    workerRef.current?.terminate();
    workerRef.current = null;
    setProcessing(false);
    setConversionStatus('');
    setConversionProgress(0);
  };

  const invalidateOutput = () => {
    stopActiveConversion();
    clearResult();
    setConversionError('');
  };

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

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
      const pending = pendingLoadRef.current;
      if (pending) {
        pending.image.onload = null;
        pending.image.onerror = null;
        URL.revokeObjectURL(pending.url);
      }
    };
  }, []);

  const loadFile = (file: File) => {
    const loadId = ++fileLoadIdRef.current;
    const pending = pendingLoadRef.current;
    if (pending) {
      pending.image.onload = null;
      pending.image.onerror = null;
      URL.revokeObjectURL(pending.url);
      pendingLoadRef.current = null;
    }
    invalidateOutput();
    setSourceError('');
    setSourceLoading(false);

    const failLoad = (message: string) => {
      if (fileLoadIdRef.current !== loadId) return;
      setSourceLoading(false);
      setSourceError(message);
    };

    const fileValidation = validateImageFile(file);
    if (fileValidation === 'not-image') {
      failLoad('Choose an image file.');
      return;
    }
    if (fileValidation === 'too-large') {
      failLoad(`Choose an image no larger than ${MAX_IMAGE_FILE_SIZE_LABEL}.`);
      return;
    }

    setSourceLoading(true);
    let url: string | undefined;
    try {
      url = URL.createObjectURL(file);
      const image = new Image();
      const pendingLoad = { image, url };
      pendingLoadRef.current = pendingLoad;
      image.onload = () => {
        if (fileLoadIdRef.current !== loadId) return;
        pendingLoadRef.current = null;
        const sourceValidation = validateImageDimensions(
          image.naturalWidth,
          image.naturalHeight,
          MAX_IMAGE_SOURCE_PIXELS,
        );
        if (sourceValidation !== 'ok') {
          URL.revokeObjectURL(pendingLoad.url);
          failLoad(`Choose an image within ${fmtInteger(MAX_IMAGE_DIMENSION)} px per side and 64 MP.`);
          return;
        }

        const safeOutput = fitImageWithinOutputLimits(image.naturalWidth, image.naturalHeight);
        invalidateOutput();
        setSource({
          file,
          url: pendingLoad.url,
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
        setWidth(safeOutput.width);
        setHeight(safeOutput.height);
        setSourceLoading(false);

        if (safeOutput.width !== image.naturalWidth || safeOutput.height !== image.naturalHeight) {
          toast.info(`Output set to ${fmtInteger(safeOutput.width)} × ${fmtInteger(safeOutput.height)} for browser stability`);
        }
      };
      image.onerror = () => {
        if (fileLoadIdRef.current !== loadId) return;
        pendingLoadRef.current = null;
        URL.revokeObjectURL(pendingLoad.url);
        failLoad('Could not load that image. Choose another file.');
      };
      image.src = url;
    } catch {
      pendingLoadRef.current = null;
      if (url) URL.revokeObjectURL(url);
      failLoad('Could not load that image. Choose another file.');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) loadFile(event.target.files[0]);
    event.target.value = '';
  };

  const onWidthChange = (value: number | '') => {
    invalidateOutput();
    setWidth(value);
    if (lockAspect && source && value !== '') {
      setHeight(Math.max(1, Math.round((value / source.width) * source.height)));
    }
  };

  const onHeightChange = (value: number | '') => {
    invalidateOutput();
    setHeight(value);
    if (lockAspect && source && value !== '') {
      setWidth(Math.max(1, Math.round((value / source.height) * source.width)));
    }
  };

  const failConversion = (conversionId: number) => {
    if (conversionIdRef.current !== conversionId) return;
    const message = 'Could not convert this image. Try another format or smaller dimensions.';
    setConversionError(message);
    setConversionStatus('');
    setConversionProgress(0);
    setProcessing(false);
  };

  const completeConversion = (blob: Blob, snapshot: ConversionSnapshot, conversionId: number) => {
    if (conversionIdRef.current !== conversionId) return;
    try {
      const actualFormat = FORMATS.find((item) => item.value === blob.type);
      setResult({
        url: URL.createObjectURL(blob),
        width: snapshot.width,
        height: snapshot.height,
        size: blob.size,
        mime: blob.type,
        extension: actualFormat?.ext ?? 'bin',
      });
      setPreview('converted');
      setConversionProgress(100);
      setConversionStatus('Ready');
      setProcessing(false);
      toast.success('Converted');
    } catch {
      failConversion(conversionId);
    }
  };

  const convertOnMainThread = (snapshot: ConversionSnapshot, conversionId: number) => {
    if (conversionIdRef.current !== conversionId) return;
    setConversionStatus('Rasterizing image');
    setConversionProgress(45);

    try {
      const image = new Image();
      image.onload = () => {
        if (conversionIdRef.current !== conversionId) return;
        try {
          const canvas = canvasRef.current;
          const context = canvas?.getContext('2d');
          if (!canvas || !context) {
            failConversion(conversionId);
            return;
          }
          canvas.width = snapshot.width;
          canvas.height = snapshot.height;
          if (snapshot.format === 'image/jpeg') {
            context.fillStyle = '#fff';
            context.fillRect(0, 0, snapshot.width, snapshot.height);
          }
          context.drawImage(image, 0, 0, snapshot.width, snapshot.height);
          setConversionStatus('Encoding output');
          setConversionProgress(85);
          canvas.toBlob(
            (blob) => {
              if (conversionIdRef.current !== conversionId) return;
              if (blob) completeConversion(blob, snapshot, conversionId);
              else failConversion(conversionId);
            },
            snapshot.format,
            snapshot.format === 'image/png' ? undefined : snapshot.quality,
          );
        } catch {
          failConversion(conversionId);
        }
      };
      image.onerror = () => failConversion(conversionId);
      image.src = snapshot.source.url;
    } catch {
      failConversion(conversionId);
    }
  };

  const convertInWorker = (snapshot: ConversionSnapshot, conversionId: number) => {
    let worker: Worker | null = null;
    let settled = false;
    const disposeWorker = () => {
      if (!worker) return;
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
    };
    const fallBackToMainThread = () => {
      if (settled) return;
      settled = true;
      disposeWorker();
      if (conversionIdRef.current !== conversionId) return;
      setConversionStatus('Retrying in browser');
      setConversionProgress(25);
      convertOnMainThread(snapshot, conversionId);
    };

    try {
      worker = new Worker(new URL('./image-converter.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<ImageWorkerResponse>) => {
        if (settled) return;
        if (conversionIdRef.current !== conversionId) {
          settled = true;
          disposeWorker();
          return;
        }
        const message = event.data;
        if (message.status === 'progress') {
          setConversionStatus(STAGE_LABELS[message.stage]);
          setConversionProgress(message.progress);
        } else if (message.status === 'done') {
          settled = true;
          disposeWorker();
          completeConversion(message.blob, snapshot, conversionId);
        } else {
          fallBackToMainThread();
        }
      };
      worker.onerror = (event) => {
        event.preventDefault();
        fallBackToMainThread();
      };
      worker.onmessageerror = fallBackToMainThread;
      worker.postMessage({
        file: snapshot.source.file,
        width: snapshot.width,
        height: snapshot.height,
        format: snapshot.format,
        quality: snapshot.quality,
      });
    } catch {
      fallBackToMainThread();
    }
  };

  const convert = () => {
    if (!source || sourceLoading || pendingLoadRef.current || processing || !canvasRef.current) return;
    const outputWidth = Number(width) || source.width;
    const outputHeight = Number(height) || source.height;
    const dimensionValidation = validateImageDimensions(outputWidth, outputHeight);
    if (dimensionValidation !== 'ok') {
      const message = dimensionValidation === 'invalid'
        ? 'Width and height must be at least 1 px.'
        : `Keep output within ${fmtInteger(MAX_IMAGE_DIMENSION)} px per side and 40 MP.`;
      setConversionError(message);
      return;
    }

    setProcessing(true);
    setConversionError('');
    setConversionStatus('Preparing image');
    setConversionProgress(5);
    clearResult();
    workerRef.current?.terminate();
    workerRef.current = null;
    const conversionId = ++conversionIdRef.current;
    const snapshot = { source, width: outputWidth, height: outputHeight, format, quality };
    const canUseWorker =
      !isSvgFile(source.file) &&
      typeof Worker !== 'undefined' &&
      typeof OffscreenCanvas !== 'undefined' &&
      typeof createImageBitmap !== 'undefined';

    if (canUseWorker) convertInWorker(snapshot, conversionId);
    else convertOnMainThread(snapshot, conversionId);
  };

  const resetDimensions = fitImageWithinOutputLimits(source?.width ?? 0, source?.height ?? 0);
  const needsSafeOutput = source && (resetDimensions.width !== source.width || resetDimensions.height !== source.height);
  const displayedResult = preview === 'converted' ? result : null;
  const displayedImage = displayedResult ?? source;
  const displayedMime = displayedResult?.mime ?? source?.file.type ?? '';
  const displayedSize = displayedResult?.size ?? source?.file.size ?? 0;
  const settingsDisabled = processing || sourceLoading;

  return (
    <ToolPage
      toolId="image-converter"
      description="Convert, resize, and compress images to JPEG, PNG, or WebP."
      width="wide"
    >
      <div className={source
        ? 'image-workspace grid min-w-0 grid-cols-1 gap-4 [grid-template-areas:"source"_"preview"_"settings"_"actions"] lg:grid-cols-[minmax(0,1fr)_18rem] lg:grid-rows-[auto_auto_1fr] lg:[grid-template-areas:"source_source"_"preview_settings"_"preview_actions"]'
        : 'max-w-xl space-y-4'}>
        <div className="image-source min-w-0 space-y-2 [grid-area:source]">
          <button
            type="button"
            className={[
              'group flex w-full min-w-0 items-center rounded-xl border border-dashed text-left transition-colors',
              source ? 'gap-3 p-3 sm:px-4' : 'flex-col gap-3 p-8 text-center',
              isDragging ? 'border-accent bg-accent/5' : 'border-edge-strong hover:border-accent/60',
            ].join(' ')}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              if (event.dataTransfer.files?.[0]) loadFile(event.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Choose an image file"
            aria-describedby={sourceError ? 'image-source-error' : 'image-source-hint'}
            aria-busy={sourceLoading}
          >
            <ImageOutline aria-hidden="true" className="h-7 w-7 shrink-0 text-ink-3" />
            {source ? (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">{source.file.name}</span>
                <span id="image-source-hint" className="block text-xs leading-relaxed text-ink-3">
                  {formatBytes(source.file.size)} · Change image<span className="hidden fine-pointer:inline"> or drop a replacement</span>
                </span>
              </span>
            ) : (
              <>
                <span className="text-sm font-medium text-ink">
                  Choose an image
                </span>
                <span id="image-source-hint" className="block text-xs text-ink-3">
                  <span className="hidden fine-pointer:inline">Or drop one here. </span>Up to {MAX_IMAGE_FILE_SIZE_LABEL}.
                </span>
              </>
            )}
          </button>
          <input ref={fileInputRef} id="img-upload" name="image-file" type="file" accept="image/*" aria-label="Choose image file" tabIndex={-1} className="sr-only" onChange={handleFileChange} />
          <p id="image-source-status" role="status" className={sourceLoading ? 'text-xs text-ink-3' : 'sr-only'}>
            {sourceLoading ? `Loading image…${source ? ' Your current image stays until the replacement is ready.' : ''}` : ''}
          </p>
          {sourceError && (
            <p id="image-source-error" role="alert" className="field-error">
              {sourceError}{source ? ' Your previous image is still available.' : ''}
            </p>
          )}
        </div>

        {source && (
          <>
            <section
              aria-labelledby="image-preview-label"
              aria-busy={sourceLoading}
              className="image-preview flex min-w-0 flex-col overflow-hidden rounded-xl border border-edge bg-surface [grid-area:preview]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge px-4 py-3">
                <h2 id="image-preview-label" className="text-sm font-medium text-ink-3">Preview</h2>
                <div role="group" aria-labelledby="image-preview-label" className="flex max-w-full flex-wrap overflow-hidden rounded-md border border-edge">
                  {PREVIEWS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={preview === item.value}
                      disabled={item.value === 'converted' && !result}
                      onClick={() => setPreview(item.value)}
                      className={[
                        'min-h-11 min-w-0 max-w-full grow wrap-anywhere px-3 py-2 text-sm font-medium transition-colors focus-visible:-outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40',
                        preview === item.value ? 'bg-accent text-accent-fg' : 'bg-surface text-ink enabled:hover:bg-muted',
                      ].join(' ')}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex min-h-64 flex-1 items-center justify-center bg-muted/30 p-4 sm:min-h-[360px] lg:min-h-[480px]">
                {displayedImage && (
                  <img
                    src={displayedImage.url}
                    alt={displayedResult ? 'Converted' : 'Original'}
                    width={displayedImage.width}
                    height={displayedImage.height}
                    aria-describedby="image-preview-metadata"
                    className="block h-auto max-h-[min(60vh,36rem)] w-auto max-w-full rounded object-contain"
                  />
                )}
              </div>
              {displayedImage && (
                <p id="image-preview-metadata" className="border-t border-edge px-4 py-3 font-mono text-xs leading-relaxed text-ink-2">
                  {fmtInteger(displayedImage.width)} × {fmtInteger(displayedImage.height)} px · {formatBytes(displayedSize)} · {formatLabel(displayedMime)}
                </p>
              )}
            </section>

            <fieldset
              disabled={settingsDisabled}
              className="image-settings min-w-0 space-y-4 rounded-xl border border-edge bg-surface p-4 [grid-area:settings] disabled:opacity-60"
            >
              <legend className="sr-only">Conversion settings</legend>
              <div>
                <p id="image-format-label" className="mb-2 text-sm font-medium text-ink-3">Output format</p>
                <Segmented
                  options={FORMATS}
                  value={format}
                  onChange={(value) => {
                    if (value === format) return;
                    invalidateOutput();
                    setFormat(value);
                  }}
                  labelledBy="image-format-label"
                  buttonClassName="flex-1 px-2 text-sm"
                />
              </div>

              {format !== 'image/png' && (
                <div>
                  <div className="mb-1.5 flex justify-between">
                    <label htmlFor="image-quality" className="text-sm font-medium text-ink-3">Quality</label>
                    <span className="text-sm font-bold text-accent">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    id="image-quality"
                    type="range" min={0.1} max={1} step={0.05} value={quality}
                    aria-label="Image quality"
                    onChange={(event) => {
                      invalidateOutput();
                      setQuality(parseFloat(event.target.value));
                    }}
                    className="h-11 w-full accent-[var(--w-accent)]"
                  />
                  <div className="mt-0.5 flex justify-between text-xs text-ink-3"><span>Low</span><span>Max</span></div>
                </div>
              )}

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink-3">Dimensions (px)</p>
                  <button
                    type="button"
                    onClick={() => {
                      invalidateOutput();
                      setLockAspect((locked) => !locked);
                    }}
                    aria-pressed={lockAspect}
                    aria-label="Lock aspect ratio"
                    className="flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-xs font-semibold text-ink-3 transition-colors hover:text-ink fine-pointer:min-h-9"
                    title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                  >
                    {lockAspect
                      ? <LockClosedOutline aria-hidden="true" className="h-3.5 w-3.5" />
                      : <LockOpenOutline aria-hidden="true" className="h-3.5 w-3.5" />}
                    {lockAspect ? 'Locked' : 'Free'}
                  </button>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,7rem),1fr))] gap-3">
                  <div>
                    <label htmlFor="image-output-width" className="mb-1 block text-sm font-medium text-ink-3">Width</label>
                    <input
                      id="image-output-width"
                      type="number" min={1} max={MAX_IMAGE_DIMENSION} value={width} placeholder="Auto"
                      aria-label="Output width"
                      aria-describedby="image-dimension-limit"
                      onChange={(event) => onWidthChange(parseDimensionInput(event.target.value))}
                      className="h-11 w-full rounded-md border border-edge bg-muted px-2 py-1.5 font-mono text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label htmlFor="image-output-height" className="mb-1 block text-sm font-medium text-ink-3">Height</label>
                    <input
                      id="image-output-height"
                      type="number" min={1} max={MAX_IMAGE_DIMENSION} value={height} placeholder="Auto"
                      aria-label="Output height"
                      aria-describedby="image-dimension-limit"
                      onChange={(event) => onHeightChange(parseDimensionInput(event.target.value))}
                      className="h-11 w-full rounded-md border border-edge bg-muted px-2 py-1.5 font-mono text-sm text-ink"
                    />
                  </div>
                </div>
                <p id="image-dimension-limit" className="mt-2 text-xs leading-relaxed text-ink-3">
                  Maximum output: {fmtInteger(MAX_IMAGE_DIMENSION)} px per side, {MAX_IMAGE_OUTPUT_PIXELS / 1_000_000} MP.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    invalidateOutput();
                    setWidth(resetDimensions.width);
                    setHeight(resetDimensions.height);
                  }}
                  className="mt-2 min-h-11 rounded-sm px-2 text-xs font-semibold text-accent underline-offset-4 hover:underline fine-pointer:min-h-9"
                >
                  {needsSafeOutput ? 'Reset to safe size' : 'Reset to original'} ({resetDimensions.width} × {resetDimensions.height})
                </button>
              </div>
            </fieldset>

            <div className="image-actions min-w-0 space-y-3 [grid-area:actions] lg:self-start">
              {!result && <Button
                size="lg"
                onClick={convert}
                disabled={processing || sourceLoading}
                aria-busy={processing}
                aria-describedby={conversionError ? 'image-conversion-error' : sourceLoading ? 'image-source-status' : undefined}
                className="w-full disabled:opacity-60"
              >
                {processing ? 'Converting…' : 'Convert Image'}
              </Button>}
              {conversionError && <p id="image-conversion-error" role="alert" className="field-error">{conversionError}</p>}
              {!processing && !result && conversionStatus && <p role="status" className="text-xs text-ink-2">{conversionStatus}</p>}
              {processing && (
                <ToolProgress
                  label={conversionStatus || 'Converting image'}
                  value={conversionProgress}
                  progressLabel="Image conversion progress"
                  onCancel={() => {
                    stopActiveConversion();
                    setConversionStatus('Conversion canceled. Your original image is still available.');
                  }}
                />
              )}
              {result && (
                <div className="space-y-3">
                  <p role="status" className="text-xs leading-relaxed text-ink-2">
                    Ready · {formatLabel(result.mime)} · {fmtInteger(result.width)} × {fmtInteger(result.height)} px · {formatBytes(result.size)}
                  </p>
                  <a
                    href={result.url}
                    download={`converted.${result.extension}`}
                    className="inline-flex min-h-11 w-full flex-wrap items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
                  >
                    <DownloadOutline aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span>Download {formatLabel(result.mime)}</span>
                  </a>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </ToolPage>
  );
}
