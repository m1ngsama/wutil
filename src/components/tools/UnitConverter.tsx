'use client';

import { useState } from 'react';

type UnitCategory = 'length' | 'weight' | 'temperature';

interface Unit {
  id: string;
  name: string;
  factor: number; // Factor relative to base unit
  offset?: number; // For temperature
}

const units: Record<UnitCategory, Unit[]> = {
  length: [
    { id: 'm', name: 'Meters', factor: 1 },
    { id: 'km', name: 'Kilometers', factor: 1000 },
    { id: 'cm', name: 'Centimeters', factor: 0.01 },
    { id: 'mm', name: 'Millimeters', factor: 0.001 },
    { id: 'in', name: 'Inches', factor: 0.0254 },
    { id: 'ft', name: 'Feet', factor: 0.3048 },
    { id: 'yd', name: 'Yards', factor: 0.9144 },
    { id: 'mi', name: 'Miles', factor: 1609.34 },
  ],
  weight: [
    { id: 'kg', name: 'Kilograms', factor: 1 },
    { id: 'g', name: 'Grams', factor: 0.001 },
    { id: 'mg', name: 'Milligrams', factor: 0.000001 },
    { id: 'lb', name: 'Pounds', factor: 0.453592 },
    { id: 'oz', name: 'Ounces', factor: 0.0283495 },
  ],
  temperature: [
    { id: 'c', name: 'Celsius', factor: 1 },
    { id: 'f', name: 'Fahrenheit', factor: 1 }, // Handled specially
    { id: 'k', name: 'Kelvin', factor: 1 }, // Handled specially
  ],
};

export default function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [inputValue, setInputValue] = useState<string>('1');

  // Derived state for output
  const outputValue = (() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return '';

    let result = 0;

    if (category === 'temperature') {
      // Special handling for temperature
      let celsius = val;
      if (fromUnit === 'f') celsius = (val - 32) * (5 / 9);
      if (fromUnit === 'k') celsius = val - 273.15;

      if (toUnit === 'c') result = celsius;
      if (toUnit === 'f') result = (celsius * 9 / 5) + 32;
      if (toUnit === 'k') result = celsius + 273.15;
    } else {
      // Linear conversion
      const from = units[category].find(u => u.id === fromUnit);
      const to = units[category].find(u => u.id === toUnit);
      if (from && to) {
        const baseValue = val * from.factor;
        result = baseValue / to.factor;
      }
    }
    return parseFloat(result.toFixed(6)).toString();
  })();

  const handleCategoryChange = (newCategory: UnitCategory) => {
    setCategory(newCategory);
    const defaultFrom = units[newCategory][0].id;
    const defaultTo = units[newCategory][1]?.id || units[newCategory][0].id;
    setFromUnit(defaultFrom);
    setToUnit(defaultTo);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Unit Converter
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Convert between common units of measurement.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-3xl mx-auto">
        <div className="mb-6">
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
           <div className="flex space-x-2">
             {(['length', 'weight', 'temperature'] as UnitCategory[]).map((cat) => (
               <button
                 key={cat}
                 onClick={() => handleCategoryChange(cat)}
                 className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 capitalize ${
                   category === cat
                     ? 'bg-blue-600 text-white'
                     : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                 }`}
               >
                 {cat}
               </button>
             ))}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From</label>
            <div className="flex space-x-2">
               <input
                type="number"
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <select
                className="block w-32 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
              >
                {units[category].map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center md:pt-6">
            <span className="text-2xl text-gray-400">→</span>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To</label>
             <div className="flex space-x-2">
               <input
                type="text"
                readOnly
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm focus:outline-none"
                value={outputValue}
              />
              <select
                className="block w-32 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
              >
                {units[category].map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
