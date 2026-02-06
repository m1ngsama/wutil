import { Metadata } from 'next';
import DateCalculatorComponent from '@/components/tools/DateCalculator';

export const metadata: Metadata = {
  title: "Date Calculator - Days Between Dates",
  description: "Free online date calculator. Calculate the duration between two dates in days, weeks, months, and years.",
  keywords: ["date calculator", "days between dates", "time duration", "online date tool"],
};

export default function Page() {
  return <DateCalculatorComponent />;
}
