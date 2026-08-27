import { site } from '@/content/site';
import type { Content } from '@/content/types';
import { DownloadIcon, GitHubIcon, LinkedInIcon } from './icons';
import { LanguageSwitch } from './language-switch';

const iconLink =
  'flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-surface-hover hover:text-ink';

/**
 * Floating pill nav rather than a full-width bar: it reads as chrome over the page.
 *
 * The frosted glass is the one deliberate performance trade on this page. backdrop-filter
 * costs about 0.9s of LCP and 5 Lighthouse points under mobile CPU throttling, at any blur
 * radius — the cost is the readback, not the radius. To take those points back, drop
 * `backdrop-blur-lg` below and set --bg-translucent to a fully opaque colour.
 */
export function Header({ content }: { content: Content }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 rounded-full border border-line bg-bg-translucent px-3 shadow-[inset_0_1px_0_var(--highlight),0_8px_28px_-16px_rgba(0,0,0,0.6)] backdrop-blur-lg sm:px-4">
        <a
          href={content.path}
          className="flex shrink-0 items-center gap-2 rounded-lg text-[0.9375rem] font-semibold tracking-tight transition-colors duration-200 hover:text-accent"
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_2px_var(--glow-a)]"
          />
          Oscar Navarro
        </a>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${content.nav.github} (${site.github})`}
            className={iconLink}
          >
            <GitHubIcon className="h-[17px] w-[17px]" />
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${content.nav.linkedin} (${site.linkedin})`}
            className={iconLink}
          >
            <LinkedInIcon className="h-[17px] w-[17px]" />
          </a>

          <LanguageSwitch content={content} />

          <a
            href={content.cvHref}
            download
            aria-label={content.nav.cv}
            className="btn btn-primary ml-1 px-3 py-2 text-xs"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{content.nav.cv}</span>
            <span className="sm:hidden">CV</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
