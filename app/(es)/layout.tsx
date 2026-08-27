import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { es } from '@/content/es';
import { buildMetadata, PersonJsonLd } from '@/lib/seo';
import '../globals.css';

const geist = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-geist' });

export const metadata: Metadata = buildMetadata(es);

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08080c' },
    { media: '(prefers-color-scheme: light)', color: '#fbfbfc' },
  ],
};

export default function SpanishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="font-sans antialiased">
        {children}
        <PersonJsonLd content={es} />
      </body>
    </html>
  );
}
