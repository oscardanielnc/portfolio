import type { Content } from '@/content/types';

/**
 * Segmented EN / ES control. Two static sides inside one track: the active side is a
 * non-interactive span so it cannot be tabbed to or clicked, the other side navigates.
 * Plain anchor on purpose — the locales are separate root layouts, so a client-side
 * navigation would reload anyway and prefetching the other page would be wasted bytes.
 */
export function LanguageSwitch({ content }: { content: Content }) {
  const current = content.locale === 'en' ? 'EN' : 'ES';
  const other = content.locale === 'en' ? 'es' : 'en';

  return (
    <div
      role="group"
      aria-label={content.nav.languageLabel}
      className="ml-1 flex items-center rounded-full border border-line bg-tag p-0.5 text-[0.6875rem] font-semibold tracking-wide"
    >
      <span
        aria-current="true"
        aria-label={content.nav.currentLanguage}
        className="rounded-full bg-ink px-2 py-1 text-bg shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
      >
        {current}
      </span>
      <a
        href={content.altPath}
        hrefLang={other}
        lang={other}
        aria-label={content.nav.languageSwitch}
        className="rounded-full px-2 py-1 text-muted transition-colors duration-200 hover:text-ink"
      >
        {content.altLabel}
      </a>
    </div>
  );
}
