export const MAX_PDF_SIZE = 10 * 1024 * 1024;

export type FileLike = Pick<File, 'name' | 'size' | 'type'>;

export function isPdfFile(file: Pick<FileLike, 'name' | 'type'>): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export function validatePdfFile(file: FileLike, maxSize = MAX_PDF_SIZE): 'ok' | 'not-pdf' | 'too-large' {
  if (!isPdfFile(file)) return 'not-pdf';
  if (file.size > maxSize) return 'too-large';
  return 'ok';
}
