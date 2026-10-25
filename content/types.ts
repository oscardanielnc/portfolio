export type Locale = 'en' | 'es';

export interface ProjectImage {
  src: string;
  /** Intrinsic size of the file. Every plate is pre-cropped to 16:10. */
  width: number;
  height: number;
}

/**
 * A recording of the running app, produced by scripts/record-demos.mjs against the live
 * deployment. A screenshot shows that a project exists; this shows that it works.
 */
export interface ProjectVideo {
  /** Path of the 1000px MP4. The phone-sized cut is the same name with an `@sm` suffix. */
  src: string;
  /** Still frame from the same cut. Also what shows when motion is unwelcome. */
  poster: string;
  /** Always 16:10, matching the plate, so the card reserves the right box before it loads. */
  width: number;
  height: number;
  /**
   * How the clip fills a plate that is taller than 16:10 because a long copy column
   * stretched the card. Recordings crop happily — you still see the app. Authored
   * diagrams do not: cropping one eats the words it was built around. `contain` letterboxes
   * instead, which is invisible when the composition already sits on the site background.
   */
  fit?: 'cover' | 'contain';
}

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
  /** One of the projects to look at first; gets a badge next to its number. */
  featured?: boolean;
  /**
   * A narrated walkthrough video, for a project that cannot have a public live demo
   * (Payment Orchestrator runs only in test mode). Takes the demo button's place.
   */
  walkthrough?: string;
  /** Real screenshot of the running app. Cards without one lay out differently. */
  image?: ProjectImage;
  /** Recording of the app in use. Takes the plate over `image` when both are present. */
  video?: ProjectVideo;
}

/** One principle of the "How I work" block in About. */
export interface Practice {
  title: string;
  line: string;
}

export interface Role {
  title: string;
  company: string;
  dates: string;
  line: string;
}

export type SectionId = 'about' | 'projects' | 'experience' | 'stack';
export type TechGroupId =
  | 'frontend'
  | 'mobile'
  | 'backend'
  | 'data'
  | 'payments'
  | 'ai'
  | 'platforms'
  | 'testing'
  | 'infrastructure';

export interface StageCopy {
  /** The four sections, in wheel order. Also their titles. */
  sections: Record<SectionId, string>;
  /** One line under the "Next section" link, per target section. */
  nextLines: Record<SectionId, string>;
  /** Accessible name of the wheel. */
  sectionsNav: string;
  back: string;
  scrollCue: string;
  /** How to use the wheel, shown under it on the home stage. */
  hint: string;
  loading: string;
  next: string;
  /** Footer line, split so the last words can glow: [plain, highlighted]. */
  footerLead: readonly [string, string];
  copy: string;
  copied: string;
  selected: string;
  email: string;
  cv: string;
  role: string;
  location: string;
  core: string;
  /** "{n} projects" — {n} is replaced by the count. */
  projectsCount: string;
  projectsNote: string;
  stackLede: string;
  whereToSee: string;
  whereToSeeLine: string;
  /** Tag on a project video: running product, archived, or no public demo. */
  liveTag: string;
  layers: string;
  techGroups: Record<TechGroupId, string>;
}

export interface Content {
  locale: Locale;
  /** Path of this page and of the other language, for the switcher and hreflang. */
  path: string;
  altPath: string;
  altLabel: string;
  altLangName: string;
  /** Locale-specific CV, resolved from site.cv. */
  cvHref: string;

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
    /** Accessible name for the language control as a whole. */
    languageLabel: string;
    /** Marks the currently active language inside the switch. */
    currentLanguage: string;
  };

  hero: {
    headline: string;
    location: string;
    intro: readonly string[];
    primaryCta: string;
    secondaryCta: string;
  };

  howIWork: {
    title: string;
    items: readonly Practice[];
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
    featured: string;
    /** Button that opens a project's walkthrough video. */
    watch: string;
    stack: string;
    /** Prefix for screenshot alt text, e.g. "Screenshot of". */
    screenshot: string;
    /** Accessible name for a demo recording, e.g. "Recording of". */
    recording: string;
    /** Shown on cards that have no screenshot. */
    noDemo: string;
  };

  /** Copy of the avatar stage: the wheel, the section panel and its chrome. */
  ui: StageCopy;

  projects: readonly Project[];
  alsoBuilt: string;
  experience: readonly Role[];
  tech: readonly string[];
}
