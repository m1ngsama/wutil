import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from './site-config.ts';

const DEFAULT_IMAGE = {
  url: '/og-image.svg',
  width: 1200,
  height: 630,
  alt: 'wutil - Web Utilities',
};

function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

function displayTitle(title: string) {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

export function createPageMetadata({
  title,
  description,
  keywords,
  path,
  imageAlt = DEFAULT_IMAGE.alt,
}: {
  title: string;
  description: string;
  keywords?: string[];
  path: '' | `/${string}`;
  imageAlt?: string;
}): Metadata {
  const canonicalPath = path || '/';
  const titleText = displayTitle(title);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'website',
      url: absoluteUrl(canonicalPath),
      siteName: SITE_NAME,
      title: titleText,
      description,
      images: [
        {
          ...DEFAULT_IMAGE,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@wutil',
      title: titleText,
      description,
      images: [
        {
          url: DEFAULT_IMAGE.url,
          alt: imageAlt,
        },
      ],
    },
  };
}
