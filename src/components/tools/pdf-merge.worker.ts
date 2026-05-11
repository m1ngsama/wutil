import { PDFDocument } from 'pdf-lib';

interface PdfMergeRequest {
  files: File[];
}

type PdfMergeResponse =
  | { status: 'progress'; label: string; progress: number }
  | { status: 'done'; blob: Blob }
  | { status: 'error'; error: string };

interface WorkerContext {
  onmessage: ((event: MessageEvent<PdfMergeRequest>) => void) | null;
  postMessage(message: PdfMergeResponse): void;
}

const ctx = self as unknown as WorkerContext;

function postProgress(label: string, progress: number) {
  ctx.postMessage({ status: 'progress', label, progress });
}

ctx.onmessage = async (event: MessageEvent<PdfMergeRequest>) => {
  const { files } = event.data;

  try {
    const merged = await PDFDocument.create();
    const totalFiles = files.length;

    for (const [index, file] of files.entries()) {
      const progressBase = Math.round((index / totalFiles) * 80);
      postProgress(`Reading ${index + 1} of ${totalFiles}`, progressBase);

      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());

      postProgress(`Adding pages from ${index + 1} of ${totalFiles}`, Math.min(progressBase + 10, 90));
      pages.forEach((page) => merged.addPage(page));
    }

    postProgress('Saving merged PDF', 95);
    const bytes = await merged.save();
    const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
    ctx.postMessage({ status: 'done', blob });
  } catch (error) {
    ctx.postMessage({
      status: 'error',
      error: error instanceof Error ? error.message : 'PDF merge failed.',
    });
  }
};
