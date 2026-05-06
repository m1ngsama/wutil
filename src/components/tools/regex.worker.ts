import { evaluateRegex } from '@/lib/regex-utils';

interface RegexWorkerRequest {
  pattern: string;
  flags: string;
  testString: string;
}

interface WorkerContext {
  onmessage: ((event: MessageEvent<RegexWorkerRequest>) => void) | null;
  postMessage(message: unknown): void;
}

const ctx = self as unknown as WorkerContext;

ctx.onmessage = (event: MessageEvent<RegexWorkerRequest>) => {
  const { pattern, flags, testString } = event.data;
  ctx.postMessage({ result: evaluateRegex(pattern, flags, testString) });
};
