import type { Metadata } from 'next';
import { en } from '@/content/en';
import { buildMetadata } from '@/lib/seo';
import { RootLayout, stageViewport } from '@/lib/root-layout';
import '../globals.css';

export const metadata: Metadata = buildMetadata(en);
export const viewport = stageViewport;

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return <RootLayout content={en}>{children}</RootLayout>;
}
