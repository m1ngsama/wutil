import { toast } from 'sonner';

export async function copyText(text: string, successMessage = 'Copied'): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard API unavailable');
    }
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
    return true;
  } catch {
    toast.error('Copy failed');
    return false;
  }
}
