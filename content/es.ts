// TODO (revisar): el brief entregó texto en español SOLO para el titular y los tres
// párrafos de presentación. Los resúmenes/detalles de proyectos, las líneas de
// experiencia y la línea "Also built" venían únicamente en inglés. Lo de abajo es una
// traducción literal de ese texto: no se añadió, quitó ni redondeó ningún dato, cifra,
// fecha ni nombre propio. Revísalo y ajústalo a tu voz antes de publicar.
import type { Content } from './types';
import { projectRefs, site, techStack } from './site';

export const es: Content = {
  locale: 'es',
  path: '/es/',
  altPath: '/',
  altLabel: 'EN',
  altLangName: 'English',
  cvHref: site.cv.es,

  meta: {
    title: 'Oscar Daniel Navarro Cieza — Desarrollador Full-Stack con especialidad en Frontend',
    description:
      'Cuatro años construyendo aplicaciones web y móviles en producción. React, Next.js y TypeScript, con responsabilidad en backend, base de datos y despliegue. Perú, UTC-5, remoto.',
  },

  nav: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    cv: 'Descargar CV',
    skipToContent: 'Ir al contenido',
    languageSwitch: 'View in English',
    languageLabel: 'Idioma',
    currentLanguage: 'Español, idioma actual',
  },

  hero: {
    headline: 'Desarrollador Full-Stack con especialidad en Frontend',
    location: 'Perú · Remoto (UTC-5) — solapamiento completo con US Eastern',
    intro: [
      'Cuatro años construyendo aplicaciones web y móviles en producción. Mi especialidad es el frontend — React, Next.js y TypeScript — y tomo responsabilidad en backend, base de datos y despliegue cuando un equipo pequeño lo requiere.',
      'Buena parte de mi trabajo reciente pone modelos de lenguaje dentro de productos que la gente usa de verdad. Todo lo despliego y lo mantengo yo mismo, y a varios de estos los dejé sin supervisión durante semanas de manera deliberada para comprobar si resistían.',
      'Perú, UTC-5. Solo remoto, disponible como contractor independiente.',
    ],
    primaryCta: 'Ver proyectos',
    secondaryCta: 'Descargar CV',
  },

  sections: {
    projects: 'Proyectos',
    experience: 'Experiencia',
    tech: 'Tecnologías',
    contact: 'Contacto',
  },

  projectLabels: {
    live: 'Ver en vivo',
    code: 'Código',
    archived: 'Archivado',
    stack: 'Stack',
    screenshot: 'Captura de',
    recording: 'Grabación de',
    noDemo: 'Sin demo pública',
  },

  projects: [
    {
      name: 'TickerLens',
      kind: 'research de acciones con IA',
      summary: 'Escribe un ticker y obtén una tesis alcista y bajista, con fuentes citadas.',
      detail:
        'Cada afirmación del análisis enlaza de vuelta a la fuente de la que salió. La recuperación opera sobre hechos que la propia aplicación calcula, no sobre texto raspado, con embeddings generados en el mismo proceso y tokens transmitidos al cliente a medida que se producen. El rate limiting está endurecido contra cabeceras forwarded falsificadas, y la aplicación degrada de forma controlada cuando la base de datos o el modelo de embeddings no están disponibles.',
      ...projectRefs.tickerlens,
    },
    {
      name: 'tvindicators',
      kind: 'motor de validación de estrategias',
      summary:
        'Estrategias de trading reimplementadas en Python y sometidas a paper trading continuo para averiguar cuáles sobreviven al mercado real.',
      detail:
        'El propósito del sistema es descartar, no ganar: mide la expectancy en vivo de cada estrategia contra su backtest y marca cuáles no reproducen lo que prometieron. Que la mayoría falle es el resultado esperado — una estrategia que se sostiene fuera de su propio backtest es la excepción, y encontrarla exige medir con honestidad las que no. Más de 40 estrategias corren contra futuros perpetuos de Binance, con una API REST que expone curvas de equity y la evaluación de vivo contra backtest. Un hook de pre-push bloquea cualquier commit en el que la ruta de señal en vivo deje de reproducir el backtest. Solo paper trading — nunca ha operado dinero real, y su propia documentación advierte contra leer el Sharpe del backtest como una expectativa en vivo.',
      ...projectRefs.tvindicators,
    },
    {
      name: 'Estudia',
      kind: 'compañero de estudio con IA',
      summary:
        'Fotografía apuntes de clase escritos a mano y obtén un resumen de estudio y un examen autocalificado.',
      detail:
        'Un pipeline de tres etapas lleva las fotografías por transcripción, resumen y generación de preguntas. Usa chunking consciente de la ventana de contexto en lugar de recuperación, de forma deliberada: el producto necesita cobertura del documento completo, no una porción relevante. Multiusuario con autenticación, instalable como progressive web app y como aplicación Android. 168 tests, y una auditoría de seguridad cuyos diez hallazgos fueron corregidos todos con tests de regresión que cubren cada uno.',
      ...projectRefs.estudia,
    },
    {
      name: 'momentum-investor',
      kind: 'auditoría de momentum en acciones',
      summary:
        'Un robot de momentum sobre acciones de EE. UU., y la auditoría que demostró que su ventaja venía de haber elegido la lista a posteriori.',
      detail:
        'Mismas reglas, motor, datos y fechas, sobre dos universos. Con 36 líderes elegidos en 2026, la estrategia rindió 29.2% al año; con las acciones que de verdad estaban en el S&P 500 en cada fecha, incluidas las que después colapsaron o fueron adquiridas, rindió 14.4%, por debajo de mantener QQQ, con 18.8%. Elegir la lista a posteriori valía 14.9 puntos de CAGR. La auditoría reproduce la mecánica real del robot y cambia solo el universo. Lo que sobrevive es un filtro de régimen sobre QQQ que no le gana en retorno: rinde de 2 a 4 puntos menos al año a cambio de un drawdown de alrededor de -30% en lugar de -49% a -53% al atravesar 2008. El robot operó en una cuenta paper de Alpaca, con órdenes idempotentes y stops en el bróker reconciliados en cada heartbeat. Pasar a dinero real dependía de la investigación, así que nunca ocurrió.',
      ...projectRefs.momentumInvestor,
      archived: true,
    },
    {
      name: 'Exposure Dashboard',
      kind: 'agregación OSINT',
      summary:
        'Dale un nombre de usuario, un correo o un documento de identidad y reporta la exposición pública con un puntaje de confianza y su razonamiento.',
      detail:
        'Trece colectores basados en plugins corren en paralelo con manejo aislado de fallos, de modo que una fuente que falla nunca tumba una búsqueda. Las identidades se correlacionan entre cuentas por hash perceptual del avatar, similitud de biografía y enlaces salientes compartidos. Cada salto de redirección se valida contra SSRF. 234 tests, corriendo en una sola vCPU.',
      ...projectRefs.exposure,
    },
    {
      name: 'Kepler',
      kind: 'sistema de trading neutral al mercado',
      summary: 'Un sistema cripto neutral al mercado que operó con capital real.',
      detail:
        'Siete sleeves de alfa no correlacionados, apalancamiento autodimensionado a un presupuesto de máximo drawdown, ejecución solo maker y un circuit breaker por drawdown. El drawdown máximo en vivo fue de 3.4% contra un presupuesto de 10% a lo largo de 18 días de operación en vivo. La validación usó walk-forward testing con datos out-of-sample purgados y embargo. Archivado por razones de negocio y no de ingeniería: el copy-trading de bajo drawdown a microcapital no producía retorno visible sin escala. Fue una decisión difícil, y sigo considerándola la correcta.',
      ...projectRefs.kepler,
      archived: true,
    },
    {
      name: 'Mi Peso',
      kind: 'registro de peso local-first',
      summary: 'Un registro de peso sin servidor y sin cuenta.',
      detail:
        'SQLite compilado a WebAssembly y persistido en el navegador, con gráficos dibujados a mano en SVG y sin librería de charting. Un mismo código se publica como progressive web app y como aplicación Android. Su propio SECURITY.md declara las dos limitaciones honestas: la base de datos no está cifrada en el dispositivo, y el APK publicado está firmado con una clave de debug y no con una clave de release.',
      ...projectRefs.mipeso,
    },
    {
      name: 'Oscilion',
      kind: 'experimento de estrategias cripto',
      summary:
        'Un sistema de trading cripto construido para responder una pregunta —¿hay ventaja después de costos reales?— y cerrado cuando la respuesta fue no.',
      detail:
        'Sus criterios de go/no-go entraron en el primer commit, antes de que existiera código de señales o de backtest. La tesis original de reversión en rangos los incumplió: en tres años y 12 monedas, neto de costos, todas las configuraciones perdieron dinero, y su score de convicción estaba calibrado al revés. Luego, cinco estrategias direccionales que habían pasado walk-forward y doble out-of-sample corrieron en vivo en dry-run: 110 operaciones en 7.8 semanas dieron -64.2R, y de 22 combinaciones positivas fuera de muestra, 2 fueron positivas en vivo. Cerrado el 3 de agosto de 2026 en la v1.0, sin haber operado nunca capital real. Su propia conclusión es que las estrategias no tienen ventaja. El código de señales es el mismo en el backtest y en el monitor en vivo, así que lo que se validó es lo que corrió.',
      ...projectRefs.oscilion,
      archived: true,
    },
  ],

  alsoBuilt:
    'También construido: un editor de video de escritorio para grabaciones de varios gigabytes con corte exacto a nivel de paquete y exportación acelerada por hardware, y un servicio de alertas de catalizadores que mide la reacción anormal real del precio a cada alerta que envía.',

  experience: [
    {
      title: 'Frontend Engineer',
      company: 'Pairus Inc. (Canadá, remoto)',
      dates: 'Jul 2025 – Ene 2026',
      line: 'Lideré el frontend de un producto de citas con IA: cuestionario de personalidad, emparejamiento basado en embeddings, dashboards de monitoreo en tiempo real e interfaces de pago con Stripe.',
    },
    {
      title: 'Software Engineer (contrato)',
      company: 'Belsitec',
      dates: 'Jun 2023 – Actualidad',
      line: 'Portales de admisión y de alumnos para una universidad que opera en Perú, Florida y México; una plataforma web completa y una app de asistencia para un colegio privado.',
    },
    {
      title: 'Frontend & Full-Stack Developer',
      company: 'Independiente',
      dates: '2023 – Actualidad',
      line: 'PWAs de reservas, sitios de negocio autogestionables con paneles de administración a medida.',
    },
    {
      title: 'Technology Consultant (prácticas)',
      company: 'IBM Perú',
      dates: 'Abr 2022 – Mar 2023',
      line: 'Desarrollo web y móvil para clientes corporativos; servicios de IBM Cloud.',
    },
  ],

  tech: techStack,
};
