'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

const PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#64748b',
  '#1e293b', '#ffffff',
];

export default function ColorConverter() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });

  const updateFromHex = useCallback((value: string) => {
    setHex(value);
    const result = hexToRgb(value);
    if (result) {
      setRgb(result);
      setHsl(rgbToHsl(result.r, result.g, result.b));
    }
  }, []);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    setRgb({ r, g, b });
    setHex(rgbToHex(r, g, b));
    setHsl(rgbToHsl(r, g, b));
  }, []);

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    setHsl({ h, s, l });
    const result = hslToRgb(h, s, l);
    setRgb(result);
    setHex(rgbToHex(result.r, result.g, result.b));
  }, []);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const hexFull = hex.startsWith('#') ? hex : '#' + hex;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Color Converter</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Convert colors between HEX, RGB, and HSL formats.</p>
      </div>

      {/* Color Preview */}
      <div className="rounded-xl overflow-hidden mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="h-32 w-full transition-colors duration-150" style={{ backgroundColor: hexFull }} />
        <div className="bg-white dark:bg-gray-800 p-4 flex items-center gap-3">
          <input
            type="color"
            value={hexFull.length === 7 ? hexFull : '#3b82f6'}
            onChange={(e) => updateFromHex(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
          />
          <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">{hexFull.toUpperCase()}</span>
        </div>
      </div>

      {/* Conversion Fields */}
      <div className="space-y-4 mb-6">
        {/* HEX */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">HEX</span>
            <button onClick={() => copyText(hexFull.toUpperCase())} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Copy</button>
          </div>
          <input
            type="text"
            value={hex}
            onChange={(e) => updateFromHex(e.target.value)}
            className="w-full font-mono text-gray-900 dark:text-gray-100 bg-transparent border-0 outline-none text-lg"
            placeholder="#000000"
          />
        </div>

        {/* RGB */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">RGB</span>
            <button onClick={() => copyText(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Copy</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['r', 'g', 'b'] as const).map((ch) => (
              <div key={ch}>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase">{ch}</label>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[ch]}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(255, Number(e.target.value)));
                    updateFromRgb(ch === 'r' ? val : rgb.r, ch === 'g' ? val : rgb.g, ch === 'b' ? val : rgb.b);
                  }}
                  className="w-full font-mono text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm"
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm font-mono text-gray-600 dark:text-gray-400">rgb({rgb.r}, {rgb.g}, {rgb.b})</p>
        </div>

        {/* HSL */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">HSL</span>
            <button onClick={() => copyText(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Copy</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">H (0-360)</label>
              <input
                type="number"
                min={0}
                max={360}
                value={hsl.h}
                onChange={(e) => updateFromHsl(Math.max(0, Math.min(360, Number(e.target.value))), hsl.s, hsl.l)}
                className="w-full font-mono text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">S (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={hsl.s}
                onChange={(e) => updateFromHsl(hsl.h, Math.max(0, Math.min(100, Number(e.target.value))), hsl.l)}
                className="w-full font-mono text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">L (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={hsl.l}
                onChange={(e) => updateFromHsl(hsl.h, hsl.s, Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-full font-mono text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
          </div>
          <p className="mt-2 text-sm font-mono text-gray-600 dark:text-gray-400">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</p>
        </div>
      </div>

      {/* Presets */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Colors</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => updateFromHex(color)}
              className="w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: color, borderColor: color === hexFull ? '#3b82f6' : 'transparent' }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
