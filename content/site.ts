import { demos } from './demos';

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
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Tailwind CSS',
  'Python',
  'FastAPI',
  'Node.js',
  'PostgreSQL',
  'SQLite',
  'Docker',
  'nginx',
  'Linux',
  'Git',
  'CI/CD',
  'LLM integration',
  'RAG',
  'Progressive Web Apps',
  'Capacitor',
  'WebAssembly',
] as const;

/** Locale-independent parts of each project: links and technology lists. */
export const projectRefs = {
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
    demo: 'https://tvbot.oscarnavarro.dev',
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
} as const;
