export const MAX_IMAGE_FILE_SIZE = 20 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 16_384;
export const MAX_IMAGE_SOURCE_PIXELS = 64_000_000;
export const MAX_IMAGE_OUTPUT_PIXELS = 40_000_000;

interface ImageFileLike {
  name: string;
  type: string;
  size: number;
}

export type ImageFileValidation = 'ok' | 'not-image' | 'too-large';
export type ImageDimensionValidation = 'ok' | 'invalid' | 'too-large';

export function validateImageFile(file: ImageFileLike): ImageFileValidation {
  const hasImageType = file.type.startsWith('image/');
  const hasImageExtension = /\.(?:avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i.test(file.name);
  if (!hasImageType && !hasImageExtension) return 'not-image';
  if (file.size > MAX_IMAGE_FILE_SIZE) return 'too-large';
  return 'ok';
}

export function validateImageDimensions(
  width: number,
  height: number,
  maxPixels = MAX_IMAGE_OUTPUT_PIXELS,
): ImageDimensionValidation {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    return 'invalid';
  }
  if (
    width > MAX_IMAGE_DIMENSION ||
    height > MAX_IMAGE_DIMENSION ||
    width * height > maxPixels
  ) {
    return 'too-large';
  }
  return 'ok';
}

export function fitImageWithinOutputLimits(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    return { width: 1, height: 1 };
  }

  const dimensionScale = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
  const pixelScale = Math.sqrt(MAX_IMAGE_OUTPUT_PIXELS / (width * height));
  const scale = Math.min(1, dimensionScale, pixelScale);

  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  };
}
