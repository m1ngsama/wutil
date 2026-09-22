export const REGEX_TEST_TIMEOUT_MS = 1500;
export const MAX_REGEX_TEST_CHARS = 50_000;
export const MAX_REGEX_MATCH_DETAILS = 20;

interface RegexPart {
  text: string;
  isMatch: boolean;
}

interface RegexMatchDetail {
  text: string;
  index: number;
  groups: (string | null)[];
}

export type RegexResult =
  | { valid: true; matchCount: number; matches: RegexMatchDetail[]; parts: RegexPart[] }
  | { valid: false; error: string };

export function evaluateRegex(
  pattern: string,
  flags: string,
  testString: string,
  maxMatchDetails = MAX_REGEX_MATCH_DETAILS,
): RegexResult {
  if (testString.length > MAX_REGEX_TEST_CHARS) {
    return { valid: false, error: `Test string is too large. Limit: ${MAX_REGEX_TEST_CHARS.toLocaleString()} characters.` };
  }

  try {
    new RegExp(pattern, flags);
    const effectiveFlags = flags.includes('g') ? flags : `${flags}g`;
    const globalRx = new RegExp(pattern, effectiveFlags);
    const parts: RegexPart[] = [];
    const matches: RegexMatchDetail[] = [];
    let matchCount = 0;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    globalRx.lastIndex = 0;
    while ((match = globalRx.exec(testString)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: testString.slice(lastIndex, match.index), isMatch: false });
      }

      parts.push({ text: match[0], isMatch: true });
      if (matches.length < maxMatchDetails) {
        matches.push({
          text: match[0],
          index: match.index,
          groups: match.slice(1).map((group) => group ?? null),
        });
      }

      matchCount += 1;
      lastIndex = match.index + match[0].length;
      if (match[0].length === 0) globalRx.lastIndex += 1;
    }

    if (lastIndex < testString.length) {
      parts.push({ text: testString.slice(lastIndex), isMatch: false });
    }

    return { valid: true, matchCount, matches, parts };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}
