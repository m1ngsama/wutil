export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

const HEX_COLOR_PATTERN = /^#?(?:[a-f\d]{3}|[a-f\d]{6})$/i;

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (!HEX_COLOR_PATTERN.test(trimmed)) return null;

  const digits = trimmed.replace('#', '').toLowerCase();
  if (digits.length === 6) return `#${digits}`;
  return `#${[...digits].map((digit) => digit.repeat(2)).join('')}`;
}

export function hexToRgb(value: string): RgbColor | null {
  const normalized = normalizeHexColor(value);
  if (!normalized) return null;

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

export function clampRgbChannel(value: number): number {
  const channel = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(255, Math.round(channel)));
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((value) => clampRgbChannel(value).toString(16).padStart(2, '0'))
    .join('')}`;
}

export function rgbToHsl(r: number, g: number, b: number): HslColor {
  const red = clampRgbChannel(r) / 255;
  const green = clampRgbChannel(g) / 255;
  const blue = clampRgbChannel(b) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5
      ? delta / (2 - max - min)
      : delta / (max + min);

    if (max === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6;
    else if (max === green) hue = ((blue - red) / delta + 2) / 6;
    else hue = ((red - green) / delta + 4) / 6;
  }

  return {
    h: Math.round(hue * 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

export function hslToRgb(h: number, s: number, l: number): RgbColor {
  const hue = Math.max(0, Math.min(360, Number.isFinite(h) ? h : 0)) / 360;
  const saturation = Math.max(0, Math.min(100, Number.isFinite(s) ? s : 0)) / 100;
  const lightness = Math.max(0, Math.min(100, Number.isFinite(l) ? l : 0)) / 100;

  if (saturation === 0) {
    const value = Math.round(lightness * 255);
    return { r: value, g: value, b: value };
  }

  const hueToRgb = (p: number, q: number, offset: number) => {
    let channel = offset;
    if (channel < 0) channel += 1;
    if (channel > 1) channel -= 1;
    if (channel < 1 / 6) return p + (q - p) * 6 * channel;
    if (channel < 1 / 2) return q;
    if (channel < 2 / 3) return p + (q - p) * (2 / 3 - channel) * 6;
    return p;
  };

  const q = lightness < 0.5
    ? lightness * (1 + saturation)
    : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return {
    r: Math.round(hueToRgb(p, q, hue + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hue) * 255),
    b: Math.round(hueToRgb(p, q, hue - 1 / 3) * 255),
  };
}
