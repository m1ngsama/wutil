'use client';

import { CheckmarkOutline, CopyOutline } from '@/components/ui/icons';
import { useEffect, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { copyText } from '@/lib/clipboard';
import { cn } from '@/lib/utils';

interface CopyButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onClick'> {
  value: string;
  label?: string;
  successMessage?: string;
}

export function CopyButton({ value, label = 'Copy', successMessage, className, disabled, ...props }: CopyButtonProps) {
  const [feedback, setFeedback] = useState({ value, version: 0, copiedRequest: 0 });
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const requestRef = useRef(0);
  const mountedRef = useRef(true);

  if (feedback.value !== value) {
    setFeedback({ value, version: feedback.version + 1, copiedRequest: 0 });
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!feedback.copiedRequest) return;
    const timer = window.setTimeout(() => {
      setFeedback((current) => current.copiedRequest === feedback.copiedRequest
        ? { ...current, copiedRequest: 0 }
        : current);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [feedback.copiedRequest]);

  return (
    <button
      type="button"
      {...props}
      disabled={disabled || !value || pending}
      aria-busy={pending || undefined}
      onClick={async () => {
        if (pendingRef.current) return;
        pendingRef.current = true;
        setPending(true);
        setFeedback((current) => ({ ...current, copiedRequest: 0 }));
        const request = ++requestRef.current;
        const version = feedback.version;
        const copied = await copyText(value, successMessage);
        if (!mountedRef.current) return;
        pendingRef.current = false;
        setPending(false);
        if (copied) {
          setFeedback((current) => current.version === version
            ? { ...current, copiedRequest: request }
            : current);
        }
      }}
      className={cn(
        'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md border border-edge bg-surface px-3 text-sm font-medium text-ink-2 transition-colors hover:border-edge-strong hover:bg-muted hover:text-ink fine-pointer:min-h-8',
        className,
      )}
    >
      {feedback.value === value && feedback.copiedRequest ? <CheckmarkOutline className="h-4 w-4" /> : <CopyOutline className="h-4 w-4" />}
      {label}
    </button>
  );
}
