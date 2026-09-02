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
    video: { src: '/demos/tickerlens.mp4', poster: '/demos/tickerlens-poster.webp', width: 1000, height: 626 },
  },
  estudia: {
    demo: 'https://study.oscarnavarro.dev',
    repo: 'https://github.com/oscardanielnc/study-ai',
    tech: ['Python', 'FastAPI', 'SQLite', 'PWA', 'Android (TWA)', 'Docker'],
    image: { src: '/projects/estudia.webp', width: 720, height: 450 },
    video: { src: '/demos/estudia.mp4', poster: '/demos/estudia-poster.webp', width: 1000, height: 626 },
  },
  tvindicators: {
    demo: 'https://tvbot.oscarnavarro.dev',
    repo: 'https://github.com/oscardanielnc/tvindicators',
    tech: ['Python', 'ccxt', 'SQLite', 'FastAPI', 'systemd'],
    image: { src: '/projects/tvindicators.webp', width: 1000, height: 625 },
    video: { src: '/demos/tvindicators.mp4', poster: '/demos/tvindicators-poster.webp', width: 1000, height: 626 },
  },
  kepler: {
    demo: null,
    repo: 'https://github.com/oscardanielnc/kepler',
    tech: ['Python', 'SQLite', 'FastAPI', 'Binance API'],
    // Archived, so there is nothing left to record: this plate is an authored diagram
    // built from Kepler's own published figures. See explainers/kepler/.
    video: {
      src: '/demos/kepler.mp4',
      poster: '/demos/kepler-poster.webp',
      width: 1000,
      height: 626,
      fit: 'contain',
    },
  },
  exposure: {
    demo: 'https://exposure.oscarnavarro.dev',
    repo: 'https://github.com/oscardanielnc/exposure-dashboard',
    tech: ['Python', 'FastAPI', 'Next.js', 'SQLite', 'Playwright', 'Docker'],
    image: { src: '/projects/exposure.webp', width: 1000, height: 625 },
    // Behind a login, so it cannot be recorded. This plate is an authored diagram of the
    // architecture, showing no identity of any kind. See explainers/exposure/.
    video: {
      src: '/demos/exposure.mp4',
      poster: '/demos/exposure-poster.webp',
      width: 1000,
      height: 626,
      fit: 'contain',
    },
  },
  mipeso: {
    demo: 'https://weightlog.oscarnavarro.dev',
    repo: 'https://github.com/oscardanielnc/control-weight',
    tech: ['React 19', 'TypeScript', 'Vite', 'SQLite/WebAssembly', 'Capacitor'],
    // Recorded on a phone viewport and letterboxed into the plate, because it is a phone app.
    video: { src: '/demos/mipeso.mp4', poster: '/demos/mipeso-poster.webp', width: 1000, height: 626 },
  },
} as const;
