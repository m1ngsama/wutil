export const MAX_PDF_SIZE = 10 * 1024 * 1024;
export const MAX_PDF_FILES = 20;
export const MAX_PDF_TOTAL_SIZE = 50 * 1024 * 1024;

export type FileLike = Pick<File, 'name' | 'size' | 'type'>;

export function isPdfFile(file: Pick<FileLike, 'name' | 'type'>): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export function validatePdfFile(file: FileLike, maxSize = MAX_PDF_SIZE): 'ok' | 'not-pdf' | 'too-large' {
  if (!isPdfFile(file)) return 'not-pdf';
  if (file.size > maxSize) return 'too-large';
  return 'ok';
}

export function validatePdfCollection(
  files: readonly Pick<FileLike, 'size'>[],
  maxFiles = MAX_PDF_FILES,
  maxTotalSize = MAX_PDF_TOTAL_SIZE,
): 'ok' | 'too-many' | 'total-too-large' {
  if (files.length > maxFiles) return 'too-many';
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > maxTotalSize) return 'total-too-large';
  return 'ok';
}
