'use client';

import { useState } from 'react';

export default function DateCalculator() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [diffResult, setDiffResult] = useState<{ days: number; weeks: string; months: string; years: string } | null>(null);

  const calculateDiff = () => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDiffResult({
      days: diffDays,
      weeks: (diffDays / 7).toFixed(1),
      months: (diffDays / 30.44).toFixed(1),
      years: (diffDays / 365.25).toFixed(2)
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Date Calculator
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Calculate the duration between two dates.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
            <input
              type="date"
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
             <input
              type="date"
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={calculateDiff}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-6"
        >
          Calculate Difference
        </button>

        {diffResult && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Result</h3>
             <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
               <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm text-center">
                 <dt className="text-xs text-gray-500 uppercase">Days</dt>
                 <dd className="text-2xl font-bold text-gray-900 dark:text-white">{diffResult.days}</dd>
               </div>
               <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm text-center">
                 <dt className="text-xs text-gray-500 uppercase">Weeks</dt>
                 <dd className="text-2xl font-bold text-gray-900 dark:text-white">{diffResult.weeks}</dd>
               </div>
               <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm text-center">
                 <dt className="text-xs text-gray-500 uppercase">Months</dt>
                 <dd className="text-2xl font-bold text-gray-900 dark:text-white">~{diffResult.months}</dd>
               </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm text-center">
                 <dt className="text-xs text-gray-500 uppercase">Years</dt>
                 <dd className="text-2xl font-bold text-gray-900 dark:text-white">~{diffResult.years}</dd>
               </div>
             </dl>
          </div>
        )}
      </div>
    </div>
  );
}
