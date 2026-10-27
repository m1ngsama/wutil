export const MAX_JSON_INPUT_CHARS = 1_000_000;
export const MAX_JSON_OUTPUT_CHARS = 4_000_000;

export type JsonOutputMode = 'format' | 'minify';

export function transformJson(source: string, mode: JsonOutputMode): string {
  if (source.length > MAX_JSON_INPUT_CHARS) {
    throw new Error('Keep JSON input under 1,000,000 characters.');
  }

  // Validate without serializing the parsed value, which would change numbers and keys.
  JSON.parse(source);

  const chunks: string[] = [];
  let length = 0;
  let depth = 0;
  let previous = '';

  const append = (text: string) => {
    if (length + text.length > MAX_JSON_OUTPUT_CHARS) {
      throw new Error('Formatted output is too large. Try Minify or reduce the nesting.');
    }
    chunks.push(text);
    length += text.length;
  };

  const newline = () => {
    const size = 1 + depth * 2;
    if (length + size > MAX_JSON_OUTPUT_CHARS) {
      throw new Error('Formatted output is too large. Try Minify or reduce the nesting.');
    }
    append(`\n${'  '.repeat(depth)}`);
  };

  const tokens = /"(?:[^"\\]|\\.)*"|[{}\[\],:]|[^\x20\t\r\n{}\[\],:]+/g;
  for (const [token] of source.matchAll(tokens)) {
    if (mode === 'minify') {
      append(token);
      continue;
    }

    const closing = token === '}' || token === ']';
    const afterOpen = previous === '{' || previous === '[';
    if (afterOpen && !closing) newline();

    if (closing) {
      depth -= 1;
      if (!afterOpen) newline();
      append(token);
    } else if (token === '{' || token === '[') {
      append(token);
      depth += 1;
    } else if (token === ',') {
      append(token);
      newline();
    } else {
      append(token === ':' ? ': ' : token);
    }
    previous = token;
  }

  return chunks.join('');
}
