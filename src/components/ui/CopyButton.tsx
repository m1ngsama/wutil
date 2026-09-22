'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState, type ButtonHTMLAttributes } from 'react';
import { copyText } from '@/lib/clipboard';
import { cn } from '@/lib/utils';

interface CopyButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onClick'> {
  value: string;
  label?: string;
  successMessage?: string;
}

export function CopyButton({ value, label = 'Copy', successMessage, className, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      disabled={!value}
      {...props}
      onClick={async () => {
        if (await copyText(value, successMessage)) setCopied(true);
      }}
      className={cn(
        'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md border border-edge bg-surface px-3 text-xs font-semibold text-ink-2 transition-colors hover:border-edge-strong hover:bg-muted hover:text-ink fine-pointer:min-h-8',
        className,
      )}
    >
      {copied ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : <Copy aria-hidden="true" className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
