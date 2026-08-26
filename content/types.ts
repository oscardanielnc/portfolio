export type Locale = 'en' | 'es';

export interface Project {
  /** Display name, identical in both locales. */
  name: string;
  /** Short qualifier shown next to the name, e.g. "AI equity research". */
  kind: string;
  /** One-line summary. */
  summary: string;
  /** Detail paragraph. */
  detail: string;
  /** Flat technology list, rendered as chips. */
  tech: readonly string[];
  /** Live demo URL, or null when the project has no demo. */
  demo: string | null;
  /** Public repository URL, or null when there is none. */
  repo: string | null;
  /** Shown in place of the demo button when demo is null. */
  archived?: boolean;
}

export interface Role {
  title: string;
  company: string;
  dates: string;
  line: string;
}

export interface Content {
  locale: Locale;
  /** Path of this page and of the other language, for the switcher and hreflang. */
  path: string;
  altPath: string;
  altLabel: string;
  altLangName: string;

  meta: {
    title: string;
    description: string;
  };

  nav: {
    github: string;
    linkedin: string;
    cv: string;
    skipToContent: string;
    languageSwitch: string;
  };

  hero: {
    headline: string;
    location: string;
    intro: readonly string[];
    primaryCta: string;
    secondaryCta: string;
  };

  sections: {
    projects: string;
    experience: string;
    tech: string;
    contact: string;
  };

  projectLabels: {
    live: string;
    code: string;
    archived: string;
    stack: string;
  };

  projects: readonly Project[];
  alsoBuilt: string;
  experience: readonly Role[];
  tech: readonly string[];
}
