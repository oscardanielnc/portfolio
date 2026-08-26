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
  },
  estudia: {
    demo: 'https://study.oscarnavarro.dev',
    repo: 'https://github.com/oscardanielnc/study-ai',
    tech: ['Python', 'FastAPI', 'SQLite', 'PWA', 'Android (TWA)', 'Docker'],
    image: { src: '/projects/estudia.webp', width: 720, height: 450 },
  },
  tvindicators: {
    demo: 'https://tvbot.oscarnavarro.dev',
    repo: 'https://github.com/oscardanielnc/tvindicators',
    tech: ['Python', 'ccxt', 'SQLite', 'FastAPI', 'systemd'],
    image: { src: '/projects/tvindicators.webp', width: 1000, height: 625 },
  },
  kepler: {
    demo: null,
    repo: 'https://github.com/oscardanielnc/kepler',
    tech: ['Python', 'SQLite', 'FastAPI', 'Binance API'],
  },
  exposure: {
    demo: 'https://exposure.oscarnavarro.dev',
    repo: 'https://github.com/oscardanielnc/exposure-dashboard',
    tech: ['Python', 'FastAPI', 'Next.js', 'SQLite', 'Playwright', 'Docker'],
    image: { src: '/projects/exposure.webp', width: 1000, height: 625 },
  },
  mipeso: {
    demo: 'https://weightlog.oscarnavarro.dev',
    repo: 'https://github.com/oscardanielnc/control-weight',
    tech: ['React 19', 'TypeScript', 'Vite', 'SQLite/WebAssembly', 'Capacitor'],
  },
} as const;
