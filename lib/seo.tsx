import type { Metadata } from 'next';
import { site } from '@/content/site';
import type { Content } from '@/content/types';

export function buildMetadata(content: Content): Metadata {
  const url = new URL(content.path, site.url).toString();
  const ogAlt = `${site.name} — ${content.hero.headline}`;

  return {
    metadataBase: new URL(site.url),
    title: content.meta.title,
    description: content.meta.description,
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    alternates: {
      canonical: content.path,
      languages: {
        en: '/',
        es: '/es/',
        'x-default': '/',
      },
    },
    openGraph: {
      type: 'website',
      url,
      siteName: site.name,
      title: content.meta.title,
      description: content.meta.description,
      locale: content.locale === 'en' ? 'en_US' : 'es_PE',
      images: [{ url: '/og.png', width: 1200, height: 630, alt: ogAlt, type: 'image/png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.meta.title,
      description: content.meta.description,
      images: [{ url: '/og.png', alt: ogAlt }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}

/**
 * schema.org Person. Emitted once per page; identical in both locales except for jobTitle.
 */
export function PersonJsonLd({ content }: { content: Content }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: content.hero.headline,
    description: content.meta.description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PE',
    },
    sameAs: [site.github, site.linkedin],
  };

  return (
    <script
      type="application/ld+json"
      // Content is a build-time constant, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
