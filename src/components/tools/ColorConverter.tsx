'use client';

import { useState, useCallback } from 'react';
import { copyText } from '@/lib/clipboard';

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(hex.trim());
  if (!r) return null;
  const expand = (s: string) => parseInt(s.length === 1 ? s + s : s, 16);
  return { r: expand(r[1]), g: expand(r[2]), b: expand(r[3]) };
}
function clampRgbChannel(value: number) {
  const channel = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(255, Math.round(channel)));
}
function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => clampRgbChannel(v).toString(16).padStart(2, '0')).join('');
}
function rgbToHsl(r: number, g: number, b: number) {
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
function hslToRgb(h: number, s: number, l: number) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h)       * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255),
  };
}

const PRESETS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#1e293b','#64748b'];

export default function ColorConverter() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState({ r: 59,  g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91,  l: 60  });

  const fromHex = useCallback((v: string) => {
    setHex(v);
    const r = hexToRgb(v);
    if (r) { setRgb(r); setHsl(rgbToHsl(r.r, r.g, r.b)); }
  }, []);
  const fromRgb = useCallback((r: number, g: number, b: number) => {
    const nextRgb = { r: clampRgbChannel(r), g: clampRgbChannel(g), b: clampRgbChannel(b) };
    setRgb(nextRgb); setHex(rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b)); setHsl(rgbToHsl(nextRgb.r, nextRgb.g, nextRgb.b));
  }, []);
  const fromHsl = useCallback((h: number, s: number, l: number) => {
    setHsl({ h, s, l }); const r = hslToRgb(h, s, l); setRgb(r); setHex(rgbToHex(r.r, r.g, r.b));
  }, []);

  const copy = (text: string) => { void copyText(text); };
  const full  = hex.startsWith('#') ? hex : '#' + hex;
  const safe  = full.length === 7 ? full : '#3b82f6';

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Data & Dev</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">Color Converter</h1>
        <p className="text-base text-ink-2 max-w-[46ch]">Convert between HEX, RGB, and HSL. Edit any field — all update together.</p>
      </header>

      {/* Preview */}
      <div className="rounded-xl overflow-hidden border border-edge mb-6">
        <div className="h-24 w-full transition-colors duration-150" style={{ backgroundColor: safe }} />
        <div className="bg-surface p-4 flex items-center gap-3">
          <input
            type="color" value={safe}
            aria-label="Choose color"
            onChange={(e) => fromHex(e.target.value)}
            className="w-9 h-9 rounded-md cursor-pointer border-0 bg-transparent p-0"
          />
          <span className="font-mono font-semibold text-ink">{full.toUpperCase()}</span>
          <button type="button" onClick={() => copy(full.toUpperCase())} className="ml-auto text-xs font-semibold text-accent hover:underline underline-offset-4">Copy</button>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3 mb-6">
        {/* HEX */}
        <div className="rounded-xl border border-edge bg-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">HEX</span>
            <button type="button" onClick={() => copy(full.toUpperCase())} className="text-xs font-semibold text-accent hover:underline underline-offset-4">Copy</button>
          </div>
          <input
            type="text" value={hex}
            onChange={(e) => fromHex(e.target.value)}
            className="w-full font-mono text-ink bg-transparent border-0 outline-none text-base"
            placeholder="#000000"
          />
        </div>

        {/* RGB */}
        <div className="rounded-xl border border-edge bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">RGB</span>
            <button type="button" onClick={() => copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} className="text-xs font-semibold text-accent hover:underline underline-offset-4">Copy</button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-2">
            {(['r','g','b'] as const).map((ch) => (
              <div key={ch}>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1">{ch}</label>
                <input
                  type="number" min={0} max={255} value={rgb[ch]}
                  aria-label={`RGB ${ch.toUpperCase()}`}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(255, Number(e.target.value)));
                    fromRgb(ch==='r'?v:rgb.r, ch==='g'?v:rgb.g, ch==='b'?v:rgb.b);
                  }}
                  className="w-full font-mono text-sm text-ink bg-muted border border-edge rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)]"
                />
              </div>
            ))}
          </div>
          <p className="font-mono text-xs text-ink-3">rgb({rgb.r}, {rgb.g}, {rgb.b})</p>
        </div>

        {/* HSL */}
        <div className="rounded-xl border border-edge bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">HSL</span>
            <button type="button" onClick={() => copy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} className="text-xs font-semibold text-accent hover:underline underline-offset-4">Copy</button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-2">
            {[
              { k: 'h' as const, label: 'H', max: 360 },
              { k: 's' as const, label: 'S', max: 100 },
              { k: 'l' as const, label: 'L', max: 100 },
            ].map(({ k, label, max }) => (
              <div key={k}>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1">{label}</label>
                <input
                  type="number" min={0} max={max} value={hsl[k]}
                  aria-label={`HSL ${label}`}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(max, Number(e.target.value)));
                    fromHsl(k==='h'?v:hsl.h, k==='s'?v:hsl.s, k==='l'?v:hsl.l);
                  }}
                  className="w-full font-mono text-sm text-ink bg-muted border border-edge rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)]"
                />
              </div>
            ))}
          </div>
          <p className="font-mono text-xs text-ink-3">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</p>
        </div>
      </div>

      {/* Presets */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">Quick colors</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((color) => (
            <button
              type="button"
              key={color}
              onClick={() => fromHex(color)}
              aria-label={`Use color ${color}`}
              className="w-8 h-8 rounded-md transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1"
              style={{ backgroundColor: color, outline: color === full ? '2px solid var(--w-accent)' : undefined, outlineOffset: '2px' }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
