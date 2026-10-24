import type { Metadata } from 'next';
import { es } from '@/content/es';
import { buildMetadata } from '@/lib/seo';
import { RootLayout, stageViewport } from '@/lib/root-layout';
import '../globals.css';

export const metadata: Metadata = buildMetadata(es);
export const viewport = stageViewport;

export default function SpanishRootLayout({ children }: { children: React.ReactNode }) {
  return <RootLayout content={es}>{children}</RootLayout>;
}
