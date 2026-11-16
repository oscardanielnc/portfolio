import { demos } from './demos';
import type { TechGroupId } from './types';

/** Facts that are identical in every locale. Single source of truth. */
export const site = {
  name: 'Oscar Daniel Navarro Cieza',
  shortName: 'Oscar Navarro',
  url: 'https://oscarnavarro.dev',
  email: 'oscar.navarro@pucp.edu.pe',
  github: 'https://github.com/oscardanielnc',
  linkedin: 'https://www.linkedin.com/in/oscardnavarro/',
  cv: { en: '/Oscar-Navarro-CV.pdf', es: '/Oscar-Navarro-CV-ES.pdf' },
} as const;

export const techStack = [
  'React',
  'NestJS',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Tailwind CSS',
  'TanStack Query',
  'Vite',
  'three.js',
  'React Native',
  'Expo',
  'Prisma',
  'BullMQ',
  'Zod',
  'Stripe',
  'Mercado Pago',
  'viem',
  'TronWeb',
  'Vitest',
  'Jest',
  'Testcontainers',
  'Playwright',
  'Storybook',
  'Python',
  'FastAPI',
  'Node.js',
  'PostgreSQL',
  'Redis',
  'SQLite',
  'Drizzle',
  'Docker',
  'nginx',
  'Linux',
  'Cloudflare',
  'AWS',
  'GitHub Actions',
  'Git',
  'LLM integration',
  'RAG',
  'Tool-calling agents',
  'LLM evals in CI',
  'Vision models',
  'OpenTelemetry tracing',
  'n8n',
  'OAuth 2.0',
  'Microsoft Graph',
  'Gmail API',
  'Webhooks',
  'Progressive Web Apps',
  'Capacitor',
  'WebAssembly',
] as const;

/** The same list, grouped by layer for the Stack section. Labels live in each locale. */
export const techGroups = [
  { id: 'frontend', items: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'TanStack Query', 'Vite', 'three.js'] },
  { id: 'mobile', items: ['React Native', 'Expo'] },
  { id: 'backend', items: ['NestJS', 'Node.js', 'Prisma', 'BullMQ', 'Zod', 'Python', 'FastAPI'] },
  { id: 'ai', items: ['LLM integration', 'RAG', 'Tool-calling agents', 'LLM evals in CI', 'Vision models', 'OpenTelemetry tracing'] },
  { id: 'automation', items: ['n8n', 'OAuth 2.0', 'Microsoft Graph', 'Gmail API', 'Webhooks'] },
  { id: 'data', items: ['PostgreSQL', 'Redis', 'SQLite', 'Drizzle'] },
  { id: 'payments', items: ['Stripe', 'Mercado Pago', 'viem', 'TronWeb'] },
  { id: 'platforms', items: ['Progressive Web Apps', 'Capacitor', 'WebAssembly'] },
  { id: 'testing', items: ['Vitest', 'Jest', 'Testcontainers', 'Playwright', 'Storybook'] },
  { id: 'infrastructure', items: ['Docker', 'nginx', 'Linux', 'Cloudflare', 'AWS', 'GitHub Actions', 'Git'] },
] as const satisfies readonly { id: TechGroupId; items: readonly (typeof techStack)[number][] }[];

/** Locale-independent parts of each project: links and technology lists. */
export const projectRefs = {
  paymentOrchestrator: {
    demo: null,
    repo: 'https://github.com/oscardanielnc/payment-orchestrator',
    tech: ['NestJS', 'TypeScript', 'PostgreSQL', 'Prisma', 'Redis + BullMQ', 'React 19', 'Stripe', 'Mercado Pago', 'viem', 'TronWeb', 'Docker'],
    // No public deployment: every rail runs in Stripe test mode or on a testnet, so the plate
    // is recorded against a local stack and the button opens a narrated two-minute walkthrough.
    walkthrough: '/walkthroughs/payment-orchestrator.mp4',
    video: demos['payment-orchestrator'],
  },
  kawsay: {
    // An Android app with no store listing, so there is no deployment to link.
    demo: null,
    repo: 'https://github.com/oscardanielnc/kawsay',
    tech: ['Expo', 'React Native', 'TypeScript', 'SQLite + Drizzle', 'NestJS', 'Prisma', 'PostgreSQL', 'DeepSeek', 'Gemini', 'OpenTelemetry'],
    // Recorded from the release APK on an Android emulator, on a fresh install with an
    // invented profile and meals, so none of its author's data is on screen.
    video: demos.kawsay,
  },
  n8nAutomations: {
    // The real instance and its panel sit behind Cloudflare Access and read real mailboxes, so
    // there is nothing public to link. The repository is a curated copy without personal data.
    demo: null,
    repo: 'https://github.com/oscardanielnc/n8n-automations',
    tech: ['n8n', 'Docker', 'PostgreSQL', 'OAuth 2.0', 'Microsoft Graph', 'Gmail API', 'OpenRouter', 'Python', 'NestJS', 'React', 'Zod', 'Cloudflare Access'],
    // Recorded against a local stack: a throwaway n8n with the published workflows and
    // dummy credentials, then the panel on its invented demo data.
    video: demos['n8n-automations'],
  },
  tickerlens: {
    demo: 'https://tickerlens.oscarnavarro.dev',
    repo: 'https://github.com/oscardanielnc/tickerlens',
    tech: ['Next.js', 'TypeScript', 'Tailwind', 'FastAPI', 'Python', 'PostgreSQL + pgvector', 'Docker', 'nginx'],
    image: { src: '/projects/tickerlens.webp', width: 1200, height: 750 },
    video: demos.tickerlens,
  },
  estudia: {
    demo: 'https://study.oscarnavarro.dev',
    repo: 'https://github.com/oscardanielnc/study-ai',
    tech: ['Python', 'FastAPI', 'SQLite', 'PWA', 'Android (TWA)', 'Docker'],
    image: { src: '/projects/estudia.webp', width: 720, height: 450 },
    video: demos.estudia,
  },
  tvindicators: {
    // Closed on 2026-11-05 and taken off the VM. The recording predates the shutdown,
    // so the video stays; there is no live dashboard left to link.
    demo: null,
    repo: 'https://github.com/oscardanielnc/tvindicators',
    tech: ['Python', 'ccxt', 'SQLite', 'FastAPI', 'systemd'],
    image: { src: '/projects/tvindicators.webp', width: 1000, height: 625 },
    video: demos.tvindicators,
  },
  kepler: {
    demo: null,
    repo: 'https://github.com/oscardanielnc/kepler',
    tech: ['Python', 'SQLite', 'FastAPI', 'Binance API'],
    // Archived, so there is nothing left to record: this plate is an authored diagram
    // built from Kepler's own published figures. See explainers/kepler/.
    video: { ...demos.kepler, fit: 'contain' },
  },
  momentumInvestor: {
    demo: null,
    repo: 'https://github.com/oscardanielnc/momentum-investor',
    tech: ['Python', 'pandas', 'FastAPI', 'SQLite', 'Alpaca API', 'Chart.js', 'systemd'],
    // Never deployed publicly, so like Kepler this is an authored diagram of the
    // README's own figures. See explainers/momentum-investor/.
    video: { ...demos['momentum-investor'], fit: 'contain' },
  },
  oscilion: {
    demo: null,
    repo: 'https://github.com/oscardanielnc/oscilion-b26',
    tech: ['Python', 'pandas', 'ccxt', 'statsmodels', 'SQLite', 'FastAPI', 'React + TypeScript', 'systemd'],
    // Closed, so nothing left to record. See explainers/oscilion/.
    video: { ...demos.oscilion, fit: 'contain' },
  },
  exposure: {
    demo: 'https://exposure.oscarnavarro.dev',
    repo: 'https://github.com/oscardanielnc/exposure-dashboard',
    tech: ['Python', 'FastAPI', 'Next.js', 'SQLite', 'Playwright', 'Docker'],
    image: { src: '/projects/exposure.webp', width: 1000, height: 625 },
    // A real search, for Oscar's own public handle. The flow computes how far it may
    // scroll so the frame never reaches a third party's row — see scripts/record-demos.mjs.
    // contain, not cover: this app puts its headline number in a narrow left column, and
    // a plate stretched by the copy beside it crops exactly that away.
    video: { ...demos.exposure, fit: 'contain' },
  },
  mipeso: {
    demo: 'https://weightlog.oscarnavarro.dev',
    repo: 'https://github.com/oscardanielnc/control-weight',
    tech: ['React 19', 'TypeScript', 'Vite', 'SQLite/WebAssembly', 'Capacitor'],
    // Recorded on a phone viewport and letterboxed into the plate, because it is a phone app.
    video: demos.mipeso,
  },
  misNotas: {
    // An Android app with no web build, so the button downloads the APK from GitHub Releases.
    demo: 'https://github.com/oscardanielnc/simulador-notas/releases/latest',
    repo: 'https://github.com/oscardanielnc/simulador-notas',
    tech: ['Expo', 'React Native', 'TypeScript', 'Reanimated', 'Zustand', 'Zod', 'Jest', 'EAS Build'],
    // Recorded from the app's own web build (same components and store) with sample grades,
    // letterboxed into the plate like Mi Peso because it is a phone app.
    video: demos['mis-notas'],
  },
} as const;
