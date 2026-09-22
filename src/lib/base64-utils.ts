export function encodeBase64(str: string, urlSafe: boolean): string {
  return new TextEncoder().encode(str).toBase64(
    urlSafe ? { alphabet: 'base64url', omitPadding: true } : undefined,
  );
}

export function decodeBase64(str: string): string {
  const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
  return new TextDecoder().decode(Uint8Array.fromBase64(normalized));
}
