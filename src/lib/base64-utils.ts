export function encodeBase64(str: string, urlSafe: boolean): string {
  const binary = Array.from(new TextEncoder().encode(str), (byte) => String.fromCharCode(byte)).join('');
  const base64 = btoa(binary);
  return urlSafe ? base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : base64;
}

export function decodeBase64(str: string): string {
  const binary = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}
