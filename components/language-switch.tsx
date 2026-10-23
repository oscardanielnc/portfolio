import type { Content } from '@/content/types';

/**
 * EN / ES. The active side is a span so it cannot be tabbed to or clicked; the other
 * side is a plain link to the other root layout. The hash travels with it, so a reader
 * inside "Projects" lands in the same section in the other language.
 */
export function LanguageSwitch({ content }: { content: Content }) {
  const current = content.locale === 'en' ? 'EN' : 'ES';
  const other = content.locale === 'en' ? 'es' : 'en';

  return (
    <div role="group" aria-label={content.nav.languageLabel} className="lang">
      <span aria-current="true" aria-label={content.nav.currentLanguage}>
        {current}
      </span>
      <a href={content.altPath} hrefLang={other} lang={other} aria-label={content.nav.languageSwitch} data-lang>
        {content.altLabel}
      </a>
    </div>
  );
}
