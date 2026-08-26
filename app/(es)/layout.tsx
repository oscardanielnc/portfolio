import type { Metadata, Viewport } from 'next';
import { es } from '@/content/es';
import { buildMetadata, PersonJsonLd } from '@/lib/seo';
import '../globals.css';

export const metadata: Metadata = buildMetadata(es);

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0d' },
    { media: '(prefers-color-scheme: light)', color: '#fcfcfb' },
  ],
};

export default function SpanishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
        <PersonJsonLd content={es} />
      </body>
    </html>
  );
}
