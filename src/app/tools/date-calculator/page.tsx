import { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import DateCalculatorComponent from '@/components/tools/DateCalculator';
import { getToolStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: "Date Calculator - Days Between Dates",
  description: "Free online date calculator. Calculate the duration between two dates in days, weeks, months, and years.",
  keywords: ["date calculator", "days between dates", "time duration", "online date tool"],
};

export default function Page() {
  return (
    <>
      <StructuredData data={getToolStructuredData('date-calculator')} />
      <DateCalculatorComponent />
    </>
  );
}
