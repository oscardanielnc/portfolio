import type { Viewport } from 'next';
import type { Content } from '@/content/types';
import { PersonJsonLd } from '@/lib/seo';
import { display } from '@/lib/fonts';

/** Marks the page for the stage; if its script has not started after 10 s, shows the static page. */
const INLINE =
  "var h=document.documentElement;h.classList.add('js');setTimeout(function(){if(!h.classList.contains('stage-on'))h.classList.remove('js')},10000)";

export const stageViewport: Viewport = {
  themeColor: '#0A1222',
  viewportFit: 'cover',
};

/**
 * Shared by both locale layouts. The one-line inline script marks the page as able to run
 * the avatar stage before anything paints, so the static layout never flashes first. The
 * mark is withdrawn if the stage script has not started after 10 s, or if WebGL is missing.
 */
export function RootLayout({ content, children }: { content: Content; children: React.ReactNode }) {
  return (
    <html lang={content.locale} className={display.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INLINE }} />
      </head>
      <body>
        {children}
        <PersonJsonLd content={content} />
      </body>
    </html>
  );
}
