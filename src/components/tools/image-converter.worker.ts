type ImageConversionStage = 'decoding' | 'drawing' | 'encoding';

interface ImageConversionRequest {
  file: File;
  width: number;
  height: number;
  format: string;
  quality: number;
}

type ImageConversionResponse =
  | { status: 'progress'; stage: ImageConversionStage; progress: number }
  | { status: 'done'; blob: Blob; size: number }
  | { status: 'error'; error: string };

interface WorkerContext {
  onmessage: ((event: MessageEvent<ImageConversionRequest>) => void) | null;
  postMessage(message: ImageConversionResponse): void;
}

const ctx = self as unknown as WorkerContext;

function postProgress(stage: ImageConversionStage, progress: number) {
  ctx.postMessage({ status: 'progress', stage, progress });
}

ctx.onmessage = async (event: MessageEvent<ImageConversionRequest>) => {
  const { file, width, height, format, quality } = event.data;

  try {
    postProgress('decoding', 20);
    const bitmap = await createImageBitmap(file);

    try {
      postProgress('drawing', 55);
      const canvas = new OffscreenCanvas(width, height);
      const canvasContext = canvas.getContext('2d');

      if (!canvasContext) {
        throw new Error('Canvas context unavailable.');
      }

      if (format === 'image/jpeg') {
        canvasContext.fillStyle = 'rgb(255, 255, 255)';
        canvasContext.fillRect(0, 0, width, height);
      }

      canvasContext.drawImage(bitmap, 0, 0, width, height);

      postProgress('encoding', 85);
      const blob = await canvas.convertToBlob({
        type: format,
        quality: format === 'image/png' ? undefined : quality,
      });

      ctx.postMessage({ status: 'done', blob, size: blob.size });
    } finally {
      bitmap.close();
    }
  } catch (error) {
    ctx.postMessage({
      status: 'error',
      error: error instanceof Error ? error.message : 'Image conversion failed.',
    });
  }
};

export {};
