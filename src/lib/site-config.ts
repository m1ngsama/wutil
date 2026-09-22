export const SITE_URL = 'https://wutil.m1ng.space';
export const SITE_NAME = 'wutil';

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}
