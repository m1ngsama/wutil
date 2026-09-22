'use client';

import { useState, useCallback } from 'react';
import { ToolPage } from '@/components/tools/ToolPage';
import { copyText } from '@/lib/clipboard';
import {
  clampRgbChannel,
  hexToRgb,
  hslToRgb,
  normalizeHexColor,
  rgbToHex,
  rgbToHsl,
} from '@/lib/color-utils';

const PRESETS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#1e293b','#64748b'];
const COPY_BUTTON_CLASS = 'min-h-11 min-w-11 rounded-sm px-2 text-xs font-semibold text-accent hover:underline underline-offset-4 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] fine-pointer:min-h-9';

export default function ColorConverter() {
  const [hexInput, setHexInput] = useState('#3b82f6');
  const [validHex, setValidHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState({ r: 59,  g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91,  l: 60  });

  const fromHex = useCallback((v: string) => {
    setHexInput(v);
    const normalized = normalizeHexColor(v);
    const nextRgb = normalized ? hexToRgb(normalized) : null;
    if (normalized && nextRgb) {
      setValidHex(normalized);
      setRgb(nextRgb);
      setHsl(rgbToHsl(nextRgb.r, nextRgb.g, nextRgb.b));
    }
  }, []);
  const fromRgb = useCallback((r: number, g: number, b: number) => {
    const nextRgb = { r: clampRgbChannel(r), g: clampRgbChannel(g), b: clampRgbChannel(b) };
    const nextHex = rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
    setRgb(nextRgb); setHexInput(nextHex); setValidHex(nextHex); setHsl(rgbToHsl(nextRgb.r, nextRgb.g, nextRgb.b));
  }, []);
  const fromHsl = useCallback((h: number, s: number, l: number) => {
    const nextRgb = hslToRgb(h, s, l);
    const nextHex = rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
    setHsl({ h, s, l }); setRgb(nextRgb); setHexInput(nextHex); setValidHex(nextHex);
  }, []);

  const hexIsValid = normalizeHexColor(hexInput) !== null;
  const hexError = hexIsValid ? null : 'Enter a valid HEX color such as #fff or #3b82f6.';
  const copy = (text: string) => {
    if (!hexIsValid) return;
    void copyText(text);
  };

  return (
    <ToolPage
      toolId="color-converter"
      title="Color Converter"
      description="Convert between HEX, RGB, and HSL. Edit any field, and the others update with it."
      width="narrow"
    >

      {/* Preview */}
      <div className="rounded-xl overflow-hidden border border-edge mb-6">
        <div className="h-24 w-full transition-colors duration-150" style={{ backgroundColor: validHex }} />
        <div className="bg-surface p-4 flex items-center gap-3">
          <input
            type="color" value={validHex}
            aria-label="Choose color"
            onChange={(e) => fromHex(e.target.value)}
            className="h-11 w-11 cursor-pointer rounded-md border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas fine-pointer:h-9 fine-pointer:w-9"
          />
          <span className="font-mono font-semibold text-ink">{validHex.toUpperCase()}</span>
          <button type="button" disabled={!hexIsValid} onClick={() => copy(validHex.toUpperCase())} className={`${COPY_BUTTON_CLASS} ml-auto`}>Copy</button>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3 mb-6">
        {/* HEX */}
        <div className="rounded-xl border border-edge bg-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">HEX</span>
            <button type="button" disabled={!hexIsValid} onClick={() => copy(validHex.toUpperCase())} className={COPY_BUTTON_CLASS}>Copy</button>
          </div>
          <input
            type="text" value={hexInput}
            aria-invalid={!hexIsValid}
            aria-describedby={hexError ? 'hex-color-error' : undefined}
            onChange={(e) => fromHex(e.target.value)}
            className={`h-11 w-full rounded-md border bg-muted px-3 font-mono text-base text-ink focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas ${hexError ? 'border-red-500/70' : 'border-edge'}`}
            placeholder="#000000"
          />
          {hexError && (
            <p id="hex-color-error" role="alert" className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {hexError}
            </p>
          )}
        </div>

        {/* RGB */}
        <div className="rounded-xl border border-edge bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">RGB</span>
            <button type="button" disabled={!hexIsValid} onClick={() => copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} className={COPY_BUTTON_CLASS}>Copy</button>
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
                  className="h-11 w-full font-mono text-sm text-ink bg-muted border border-edge rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas"
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
            <button type="button" disabled={!hexIsValid} onClick={() => copy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} className={COPY_BUTTON_CLASS}>Copy</button>
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
                  className="h-11 w-full font-mono text-sm text-ink bg-muted border border-edge rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas"
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
              aria-pressed={hexIsValid && color.toLowerCase() === validHex}
              className={`h-11 w-11 rounded-md ring-offset-2 ring-offset-canvas transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] fine-pointer:h-8 fine-pointer:w-8 ${hexIsValid && color.toLowerCase() === validHex ? 'ring-2 ring-accent' : 'hover:ring-2 hover:ring-edge-strong'}`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
