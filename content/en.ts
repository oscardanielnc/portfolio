import type { Content } from './types';
import { projectRefs, site, techStack } from './site';

export const en: Content = {
  locale: 'en',
  path: '/',
  altPath: '/es/',
  altLabel: 'ES',
  altLangName: 'Español',
  cvHref: site.cv.en,

  meta: {
    title: 'Oscar Daniel Navarro Cieza — Full-Stack Product Engineer · AI Engineer',
    description:
      'Full-stack product engineer, four years shipping production web and mobile apps. Frontend specialist (React, Next.js, TypeScript) who builds the whole stack when needed: NestJS, PostgreSQL, payments, React Native. Peru, UTC-5, remote.',
  },

  nav: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    cv: 'Download CV',
    skipToContent: 'Skip to content',
    languageSwitch: 'Ver en español',
    languageLabel: 'Language',
    currentLanguage: 'English, current language',
  },

  hero: {
    headline: 'Full-Stack Product Engineer · AI Engineer',
    location: 'Peru · Remote (UTC-5) — full overlap with US Eastern',
    intro: [
      'Four years shipping production web and mobile applications. Frontend is my specialty — React, Next.js and TypeScript — and I build the rest of the stack whenever the product needs it: NestJS APIs, PostgreSQL, queues, payments and mobile.',
      'I work with Claude Code every day. I write the specs and architecture decisions first, test every path, and make sure I understand the code well enough to defend it and fix it fast.',
      'Based in Peru, UTC-5. Remote only, available as an independent contractor.',
    ],
    primaryCta: 'View projects',
    secondaryCta: 'Download CV',
  },

  howIWork: {
    title: 'How I work',
    items: [
      {
        title: 'Specs before code',
        line: 'Every repository keeps its vision, feature specs, architecture decision records and runbooks.',
      },
      {
        title: 'Tested, then trusted',
        line: 'I test every path. The payment orchestrator has 300+ tests and was verified on real test networks.',
      },
      {
        title: 'Learning by teaching myself',
        line: 'When a project needs something new, I write my own lessons first.',
      },
      {
        title: 'Context that persists',
        line: 'Project docs plus a personal knowledge base give AI agents the full picture in every session.',
      },
    ],
  },

  sections: {
    projects: 'Projects',
    experience: 'Experience',
    tech: 'Technologies',
    contact: 'Contact',
  },

  projectLabels: {
    live: 'View live',
    code: 'Code',
    archived: 'Archived',
    featured: 'Featured',
    watch: 'Watch the demo',
    stack: 'Stack',
    screenshot: 'Screenshot of',
    recording: 'Recording of',
    noDemo: 'No public demo',
  },

  ui: {
    sections: { about: 'About', projects: 'Projects', experience: 'Experience', stack: 'Stack' },
    nextLines: {
      about: 'Who I am and how I work',
      projects: 'Ten projects, from payments to trading research',
      experience: 'Where I have worked, and when',
      stack: 'The tools behind the projects',
    },
    sectionsNav: 'Sections',
    back: 'Back to the wheel',
    scrollCue: 'Scroll to explore',
    hint: 'Scroll, swipe or use ← → · click to open',
    loading: 'Loading the avatar',
    next: 'Next section',
    footerLead: ['Let’s build something', 'together'],
    copy: 'Copy',
    copied: 'Copied',
    selected: 'Selected',
    email: 'Email',
    cv: 'CV (PDF)',
    role: 'Role',
    location: 'Location',
    core: 'Core',
    projectsCount: '{n} projects',
    projectsNote:
      'Each one is deployed, recorded or documented. The ones marked archived were closed on purpose, and they say why.',
    stackLede: 'The tools behind the projects, grouped by layer.',
    whereToSee: 'Where to see them',
    whereToSeeLine: 'Every project lists its own stack.',
    liveTag: 'Live product',
    layers: 'Layers',
    techGroups: {
      frontend: 'Frontend',
      backend: 'Backend',
      data: 'Data',
      ai: 'AI',
      platforms: 'Apps & platforms',
      infrastructure: 'Infrastructure',
      mobile: 'Mobile',
      payments: 'Payments',
      testing: 'Testing',
    },
  },

  projects: [
    {
      name: 'Payment Orchestrator',
      kind: 'payments platform',
      summary:
        'One API and a hosted checkout that route each payment to cards, Mercado Pago, USDT on TRON or USDC on Base, and record every cent in a double-entry ledger.',
      detail:
        'Run only in test mode and on public testnets, and verified with real Stripe test payments, Mercado Pago test users and on-chain transfers on TRON Nile and Base Sepolia. Idempotency keys in Postgres, a transactional outbox, and an append-only ledger that database triggers protect. Crypto deposits go to addresses derived from an extended public key, so the server cannot spend them. A payment whose webhook never arrives is caught by a status check and a daily reconciliation that never moves money on its own. Twenty-three architecture decisions are written down with the options they rejected. I built it while learning NestJS, ledgers and on-chain payments from scratch, from lessons I wrote myself, and it has more than 300 tests.',
      ...projectRefs.paymentOrchestrator,
      featured: true,
    },
    {
      name: 'Kawsay',
      kind: 'offline-first nutrition app',
      summary: 'A food, activity and mood journal whose nutrition targets follow the day you actually had.',
      detail:
        'An Expo and React Native app that works without a connection: SQLite with Drizzle on the phone, synced to a NestJS and Prisma API. The phone and the server share the same TypeScript rules, so targets are computed offline. The AI only picks foods; food-composition tables compute the nutrients, and private entries never reach the model. More than 600 tests. In daily use by its author; the repository stays private until its public release.',
      ...projectRefs.kawsay,
      featured: true,
    },
    {
      name: 'TickerLens',
      kind: 'AI equity research',
      summary: 'Type a ticker, get a cited bull and bear case.',
      detail:
        'Every claim in the analysis links back to the source it came from. Retrieval runs over facts the application computes itself rather than over scraped text, with embeddings generated in-process and tokens streamed to the client as they are produced. Rate limiting is hardened against spoofed forwarded headers, and the app degrades gracefully when the database or the embedding model is unavailable.',
      ...projectRefs.tickerlens,
      featured: true,
    },
    {
      name: 'Estudia',
      kind: 'AI study companion',
      summary: 'Photograph handwritten class notes, get a study summary and an auto-graded exam.',
      detail:
        'A three-stage pipeline takes the photographs through transcription, summary and question generation. It uses context-window-aware chunking rather than retrieval, deliberately: the product needs full-document coverage, not a relevant slice. Multi-user with authentication, installable as a progressive web app and as an Android app. 168 tests, and a security audit whose ten findings were all fixed with regression tests covering each one.',
      ...projectRefs.estudia,
    },
    {
      name: 'Exposure Dashboard',
      kind: 'OSINT aggregation',
      summary:
        'Give it a username, email or national ID and it reports public exposure with a confidence score and its reasoning.',
      detail:
        'Thirteen plugin-based collectors run in parallel with isolated failure handling, so one failing source never takes down a search. Identities are correlated across accounts by avatar perceptual hash, bio similarity and shared outbound links. Every redirect hop is validated against SSRF. 234 tests, running on a single vCPU.',
      ...projectRefs.exposure,
    },
    {
      name: 'Mi Peso',
      kind: 'local-first weight tracker',
      summary: 'A weight tracker with no server and no account.',
      detail:
        'SQLite compiled to WebAssembly and persisted in the browser, with charts drawn by hand in SVG and no charting library. One codebase ships as a progressive web app and as an Android app. Its own SECURITY.md states the two honest limitations: the database is not encrypted on the device, and the published APK is signed with a debug key rather than a release key.',
      ...projectRefs.mipeso,
    },
    {
      name: 'Mis notas',
      kind: 'grade simulator app',
      summary: 'Drag a number and see the final grade you need, before the exam rather than after it.',
      detail:
        'An Expo and React Native app for a university student in Peru. Each syllabus is a weighted tree computed by one recursive function in a pure TypeScript core, with no rounding until the course grade. Every grade has two layers: the one you drag to ask "what if?", and the real one, marked with a star, which is the only one saved. The general average is weighted by credits. The number picker runs on the UI thread with Reanimated, and the APK went from 112 MB to 21 MB by shipping only arm64 and shrinking with R8. 53 tests.',
      ...projectRefs.misNotas,
    },
    {
      name: 'tvindicators',
      kind: 'strategy validation engine',
      summary:
        'Trading strategies reimplemented in Python and put through continuous paper trading to find out which ones survive contact with the live market.',
      detail:
        'The system exists to rule strategies out, not to make money: it measures each one’s live expectancy against its backtest and flags the ones that stop reproducing what they promised. Most failing is the expected result — a strategy that holds up outside its own backtest is the exception, and finding one means measuring the rest honestly. Over 40 strategies run against Binance perpetual futures, with a REST API exposing equity curves and the live-versus-backtest evaluation. A pre-push hook blocks any commit where the live signal path stops reproducing the backtest. Paper trading only — it has never traded real money, and its own documentation warns against reading the backtest Sharpe as a live expectation.',
      ...projectRefs.tvindicators,
    },
    {
      name: 'momentum-investor',
      kind: 'stock momentum audit',
      summary:
        'A US-stock momentum robot, and the audit that showed its edge came from choosing the stock list with hindsight.',
      detail:
        'Same rules, engine, data and dates, run on two universes. On 36 market leaders chosen in 2026 the strategy returned 29.2% a year; on the stocks actually in the S&P 500 on each date, including the ones that later collapsed or were acquired, it returned 14.4% — below holding QQQ at 18.8%. Choosing the list with hindsight was worth 14.9 points of CAGR. The audit replays the robot’s real mechanics and changes only the universe. What survives is a regime filter on QQQ that does not beat it on return: it earns 2 to 4 points a year less, in exchange for a drawdown of about -30% instead of -49% to -53% through 2008. The robot ran on an Alpaca paper account, with idempotent orders and broker-side stops reconciled on every heartbeat. Moving to real money depended on the research, so it never happened.',
      ...projectRefs.momentumInvestor,
      archived: true,
    },
    {
      name: 'Kepler',
      kind: 'market-neutral trading system',
      summary: 'A market-neutral crypto system that ran on real capital.',
      detail:
        'Seven uncorrelated alpha sleeves, leverage auto-sized to a maximum-drawdown budget, maker-only execution and a drawdown circuit breaker. Live maximum drawdown was 3.4% against a 10% budget across 18 days of live operation. Validation used walk-forward testing with purged out-of-sample data and embargo. Archived for business reasons rather than engineering ones: low-drawdown copy-trading at micro-capital produced no visible return without scale. It was a difficult decision, and I still consider it the correct one.',
      ...projectRefs.kepler,
      archived: true,
    },
    {
      name: 'Oscilion',
      kind: 'crypto strategy experiment',
      summary:
        'A crypto trading system built to answer one question — is there an edge after real costs? — and closed when the answer was no.',
      detail:
        'Its go/no-go criteria went into the first commit, before any signal or backtest code existed. The original range-reversion thesis failed them: over three years and 12 coins, net of costs, every configuration lost money, and its conviction score was inversely calibrated. Five directional strategies that had passed walk-forward and double out-of-sample checks were then run live in dry-run: 110 trades over 7.8 weeks returned -64.2R, and of 22 combinations positive out of sample, 2 were positive live. Closed on 3 August 2026 at v1.0, with no real capital ever traded. Its own conclusion is that the strategies have no edge. The signal code is shared by the backtest and the live monitor, so what was validated is what ran.',
      ...projectRefs.oscilion,
      archived: true,
    },
  ],

  alsoBuilt:
    'Also built: a desktop video editor for multi-gigabyte recordings with packet-accurate cutting and hardware-accelerated export, and a catalyst alerting service that measures the actual abnormal price reaction to each alert it sends.',

  experience: [
    {
      title: 'Frontend Engineer',
      company: 'Pairus Inc. (Canada, remote)',
      dates: 'Jul 2025 – Jan 2026',
      line: 'Led the frontend of an AI dating product: personality questionnaire, embedding-based matching, real-time monitoring dashboards and Stripe payment interfaces.',
    },
    {
      title: 'Software Engineer (contract)',
      company: 'Belsitec',
      dates: 'Jun 2023 – Present',
      line: 'Admission and student portals for a university operating in Peru, Florida and Mexico; a full web platform and attendance app for a private school; and Contipay, the in-house payment gateway I maintain.',
    },
    {
      title: 'Frontend & Full-Stack Developer',
      company: 'Independent',
      dates: '2023 – Present',
      line: 'Reservation PWAs, self-manageable business sites with custom admin panels.',
    },
    {
      title: 'Technology Consultant (internship)',
      company: 'IBM Peru',
      dates: 'Apr 2022 – Mar 2023',
      line: 'Web and mobile development for corporate clients; IBM Cloud services.',
    },
  ],

  tech: techStack,
};
