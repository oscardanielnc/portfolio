import type { Metadata, Viewport } from 'next';
import { en } from '@/content/en';
import { buildMetadata, PersonJsonLd } from '@/lib/seo';
import '../globals.css';

export const metadata: Metadata = buildMetadata(en);

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0d' },
    { media: '(prefers-color-scheme: light)', color: '#fcfcfb' },
  ],
};

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <PersonJsonLd content={en} />
      </body>
    </html>
  );
}
