'use client';

import { useState, useMemo } from 'react';
import { copyText } from '@/lib/clipboard';
import { parseUnitInput } from '@/lib/unit-utils';

type Category = 'length' | 'weight' | 'temperature' | 'volume' | 'area' | 'speed' | 'data';

interface Unit { id: string; label: string; factor: number }

const UNITS: Record<Category, Unit[]> = {
  length: [
    { id: 'km',  label: 'Kilometers',    factor: 1000      },
    { id: 'm',   label: 'Meters',         factor: 1         },
    { id: 'cm',  label: 'Centimeters',    factor: 0.01      },
    { id: 'mm',  label: 'Millimeters',    factor: 0.001     },
    { id: 'mi',  label: 'Miles',          factor: 1609.344  },
    { id: 'yd',  label: 'Yards',          factor: 0.9144    },
    { id: 'ft',  label: 'Feet',           factor: 0.3048    },
    { id: 'in',  label: 'Inches',         factor: 0.0254    },
    { id: 'nmi', label: 'Nautical miles', factor: 1852      },
  ],
  weight: [
    { id: 't',   label: 'Tonnes',      factor: 1000       },
    { id: 'kg',  label: 'Kilograms',   factor: 1          },
    { id: 'g',   label: 'Grams',       factor: 0.001      },
    { id: 'mg',  label: 'Milligrams',  factor: 0.000001   },
    { id: 'lb',  label: 'Pounds',      factor: 0.453592   },
    { id: 'oz',  label: 'Ounces',      factor: 0.0283495  },
    { id: 'st',  label: 'Stone',       factor: 6.35029    },
  ],
  temperature: [
    { id: 'c', label: 'Celsius',    factor: 1 },
    { id: 'f', label: 'Fahrenheit', factor: 1 },
    { id: 'k', label: 'Kelvin',     factor: 1 },
  ],
  volume: [
    { id: 'l',    label: 'Liters',         factor: 1           },
    { id: 'ml',   label: 'Milliliters',    factor: 0.001       },
    { id: 'm3',   label: 'Cubic meters',   factor: 1000        },
    { id: 'gal',  label: 'Gallons (US)',   factor: 3.78541     },
    { id: 'qt',   label: 'Quarts (US)',    factor: 0.946353    },
    { id: 'pt',   label: 'Pints (US)',     factor: 0.473176    },
    { id: 'cup',  label: 'Cups (US)',      factor: 0.236588    },
    { id: 'floz', label: 'Fl oz (US)',     factor: 0.0295735   },
    { id: 'tbsp', label: 'Tablespoons',    factor: 0.0147868   },
    { id: 'tsp',  label: 'Teaspoons',      factor: 0.00492892  },
  ],
  area: [
    { id: 'km2', label: 'Sq kilometers',  factor: 1_000_000  },
    { id: 'm2',  label: 'Sq meters',      factor: 1          },
    { id: 'cm2', label: 'Sq centimeters', factor: 0.0001     },
    { id: 'ha',  label: 'Hectares',       factor: 10_000     },
    { id: 'ac',  label: 'Acres',          factor: 4046.856   },
    { id: 'mi2', label: 'Sq miles',       factor: 2_589_988  },
    { id: 'ft2', label: 'Sq feet',        factor: 0.092903   },
    { id: 'in2', label: 'Sq inches',      factor: 0.00064516 },
  ],
  speed: [
    { id: 'kph',  label: 'km/h',   factor: 1         },
    { id: 'mph',  label: 'mph',    factor: 1.60934   },
    { id: 'mps',  label: 'm/s',    factor: 3.6       },
    { id: 'fps',  label: 'ft/s',   factor: 1.09728   },
    { id: 'kn',   label: 'Knots',  factor: 1.852     },
  ],
  data: [
    { id: 'tb',  label: 'Terabytes',  factor: 1_099_511_627_776 },
    { id: 'gb',  label: 'Gigabytes',  factor: 1_073_741_824     },
    { id: 'mb',  label: 'Megabytes',  factor: 1_048_576         },
    { id: 'kb',  label: 'Kilobytes',  factor: 1024              },
    { id: 'b',   label: 'Bytes',      factor: 1                 },
    { id: 'bit', label: 'Bits',       factor: 0.125             },
  ],
};

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'length',      label: 'Length'      },
  { id: 'weight',      label: 'Weight'      },
  { id: 'temperature', label: 'Temperature' },
  { id: 'volume',      label: 'Volume'      },
  { id: 'area',        label: 'Area'        },
  { id: 'speed',       label: 'Speed'       },
  { id: 'data',        label: 'Data'        },
];

function convertTemp(val: number, from: string, to: string): number {
  let c = val;
  if (from === 'f') c = (val - 32) * 5 / 9;
  if (from === 'k') c = val - 273.15;
  if (to   === 'c') return c;
  if (to   === 'f') return c * 9 / 5 + 32;
  return c + 273.15; // kelvin
}

function formatNum(n: number): string {
  if (!isFinite(n)) return '—';
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4);
  const s = parseFloat(n.toPrecision(7)).toString();
  return s;
}

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>('length');
  const [fromId,   setFromId]   = useState('m');
  const [toId,     setToId]     = useState('ft');
  const [input,    setInput]    = useState('1');

  const selectCategory = (nextCategory: Category) => {
    const units = UNITS[nextCategory];
    setCategory(nextCategory);
    setFromId(units[0].id);
    setToId(units[1]?.id ?? units[0].id);
  };

  const output = useMemo(() => {
    const val = parseUnitInput(input);
    if (val === null) return '';
    const units = UNITS[category];
    const from  = units.find((u) => u.id === fromId);
    const to    = units.find((u) => u.id === toId);
    if (!from || !to) return '';
    if (category === 'temperature') return formatNum(convertTemp(val, fromId, toId));
    return formatNum((val * from.factor) / to.factor);
  }, [input, fromId, toId, category]);

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
    setInput(output || input);
  };

  const units = UNITS[category];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Calculators</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">Unit Converter</h1>
        <p className="text-base text-ink-2 max-w-[48ch]">Convert between units instantly across 7 categories.</p>
      </header>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(({ id, label }) => (
          <button
            type="button"
            key={id}
            onClick={() => selectCategory(id)}
            className={[
              'px-3 py-1.5 text-sm font-medium rounded-md border transition-colors',
              category === id
                ? 'bg-accent text-accent-fg border-accent'
                : 'bg-surface text-ink border-edge hover:bg-muted',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Converter */}
      <div className="rounded-xl border border-edge bg-surface p-6 space-y-5">
        {/* From row */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">From</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={input}
              aria-label="Input value"
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-11 px-4 rounded-md border border-edge bg-canvas text-ink font-mono text-base focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-1"
            />
            <select
              value={fromId}
              aria-label="From unit"
              onChange={(e) => setFromId(e.target.value)}
              className="h-11 px-3 rounded-md border border-edge bg-canvas text-ink text-sm focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)]"
            >
              {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
        </div>

        {/* Swap */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-edge" />
          <button
            type="button"
            onClick={swap}
            className="h-8 w-8 flex items-center justify-center rounded-full border border-edge bg-surface text-ink-2 hover:bg-muted hover:text-ink transition-colors"
            title="Swap units"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          <div className="flex-1 h-px bg-edge" />
        </div>

        {/* To row */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">To</label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!output}
              className="flex-1 h-11 px-4 flex items-center rounded-md border border-edge bg-muted text-ink font-mono text-base text-left hover:border-edge-strong disabled:cursor-default disabled:hover:border-edge transition-colors"
              onClick={() => { if (output) void copyText(output); }}
              title={output ? 'Click to copy' : undefined}
              aria-label={output ? `Copy converted value ${output}` : 'Converted value'}
            >
              <span className={output ? 'text-ink' : 'text-ink-3'}>
                {output || '—'}
              </span>
            </button>
            <select
              value={toId}
              aria-label="To unit"
              onChange={(e) => setToId(e.target.value)}
              className="h-11 px-3 rounded-md border border-edge bg-canvas text-ink text-sm focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)]"
            >
              {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
          {output && <p className="text-xs text-ink-3">Click result to copy</p>}
        </div>
      </div>
    </div>
  );
}
