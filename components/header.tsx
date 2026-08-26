import { site } from '@/content/site';
import type { Content } from '@/content/types';
import { DownloadIcon, GitHubIcon, LinkedInIcon } from './icons';

const iconLink =
  'flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors duration-200 hover:bg-surface-hover hover:text-ink';

export function Header({ content }: { content: Content }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg-translucent backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
        <a
          href={content.path}
          className="shrink-0 text-[0.9375rem] font-semibold tracking-tight transition-colors duration-200 hover:text-accent"
        >
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
            <GitHubIcon className="h-[18px] w-[18px]" />
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${content.nav.linkedin} (${site.linkedin})`}
            className={iconLink}
          >
            <LinkedInIcon className="h-[18px] w-[18px]" />
          </a>

          {/* Plain anchor: the two locales are separate root layouts, so a client-side
              navigation would reload anyway — and it avoids prefetching the other page. */}
          <a
            href={content.altPath}
            hrefLang={content.locale === 'en' ? 'es' : 'en'}
            lang={content.locale === 'en' ? 'es' : 'en'}
            aria-label={content.nav.languageSwitch}
            className="ml-0.5 rounded-md border border-line px-2 py-1.5 text-xs font-medium tracking-wide text-muted transition-colors duration-200 hover:border-line-strong hover:text-ink"
          >
            {content.altLabel}
          </a>

          <a
            href={site.cv}
            download
            aria-label={content.nav.cv}
            className="ml-1 inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-on-accent transition-opacity duration-200 hover:opacity-85 sm:px-3"
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
