const READING_WORDS_PER_MINUTE = 238;

export interface WordStats {
  words: number;
  chars: number;
  charsNoSpaces: number;
  sentences: number;
  paragraphs: number;
  uniqueWords: number;
  readSeconds: number;
  readLabel: string;
}

function formatReadingTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

export function calculateWordStats(text: string, locale?: string): WordStats | null {
  if (!text.trim()) return null;

  const wordSegments = [...new Intl.Segmenter(locale, { granularity: 'word' }).segment(text)]
    .filter((segment) => segment.isWordLike)
    .map((segment) => segment.segment);
  const sentenceSegments = [
    ...new Intl.Segmenter(locale, { granularity: 'sentence' }).segment(text),
  ].filter((segment) => segment.segment.trim().length > 0);
  const readSeconds = Math.round((wordSegments.length / READING_WORDS_PER_MINUTE) * 60);
  const uniqueWords = new Set(
    wordSegments.map((word) => word.normalize('NFKC').toLocaleLowerCase(locale)),
  ).size;

  return {
    words: wordSegments.length,
    chars: text.length,
    charsNoSpaces: text.replace(/\s/gu, '').length,
    sentences: sentenceSegments.length,
    paragraphs: text.split(/\n\s*\n/u).filter((paragraph) => paragraph.trim()).length || 1,
    uniqueWords,
    readSeconds,
    readLabel: formatReadingTime(readSeconds),
  };
}
