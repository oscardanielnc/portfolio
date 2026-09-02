import { site } from '@/content/site';
import type { Content } from '@/content/types';
import { Header } from './header';
import { ProjectCard, type Variant } from './project-card';
import { ArrowIcon, DownloadIcon, GitHubIcon, LinkedInIcon } from './icons';

const shell = 'mx-auto max-w-5xl px-4 sm:px-6';
const heading = 'text-3xl font-semibold tracking-[-0.03em] sm:text-4xl';

/** Card composition per project, in the fixed order the projects are listed in.
    Every project now carries a plate, so nothing takes the text variant any more: the
    two half-width standards sit together in one row and the rest are full width,
    mirroring left and right alternately so the page does not read as a stack. */
const variants: readonly Variant[] = [
  'featured',
  'standard',
  'standard',
  'featured-reverse',
  'featured',
  'featured-reverse',
];

export function SitePage({ content }: { content: Content }) {
  const [lead, ...rest] = content.hero.intro;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
      >
        {content.nav.skipToContent}
      </a>

      <Header content={content} />

      <main id="main">
        {/* Hero */}
        <section className="ambient overflow-hidden pt-28 sm:pt-36">
          <div className={`${shell} grid gap-x-12 gap-y-12 pb-20 lg:grid-cols-12 lg:pb-28`}>
            <div className="lg:col-span-7">
              <p className="eyebrow enter enter-1">{content.hero.location}</p>

              <h1 className="display enter-soft enter-2 mt-6">{site.name}</h1>

              <p className="enter-soft enter-2 mt-4 text-xl font-medium text-muted sm:text-2xl">
                {content.hero.headline}
              </p>

              {lead && (
                <p className="enter-soft enter-3 mt-8 max-w-[58ch] text-[0.9375rem] leading-[1.8] text-muted sm:text-base">
                  {lead}
                </p>
              )}

              <div className="enter enter-4 mt-10 flex flex-wrap items-center gap-3">
                <a href="#projects" className="btn btn-primary px-5 py-3 text-sm">
                  {content.hero.primaryCta}
                  <ArrowIcon className="h-4 w-4" />
                </a>
                <a href={content.cvHref} download className="btn btn-secondary px-5 py-3 text-sm">
                  <DownloadIcon className="h-4 w-4" />
                  {content.hero.secondaryCta}
                </a>
              </div>
            </div>

            <div className="enter enter-4 flex flex-col justify-end gap-5 lg:col-span-5 lg:pb-1">
              {rest.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="max-w-[52ch] text-[0.875rem] leading-[1.85] text-muted"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* Projects */}
        <section id="projects" className={`${shell} py-20 sm:py-28`}>
          <h2 className={`${heading} reveal`}>{content.sections.projects}</h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {content.projects.map((project, index) => (
              <ProjectCard
                key={project.name}
                project={project}
                labels={content.projectLabels}
                variant={variants[index] ?? 'standard'}
              />
            ))}
          </div>

          <p className="reveal mt-10 max-w-[75ch] text-sm leading-[1.8] text-muted">
            {content.alsoBuilt}
          </p>
        </section>

        <hr className="rule" />

        {/* Experience */}
        <section id="experience" className={`${shell} py-20 sm:py-28`}>
          <h2 className={`${heading} reveal`}>{content.sections.experience}</h2>

          <ol className="mt-10 grid gap-4">
            {content.experience.map((role) => (
              <li
                key={`${role.company}-${role.dates}`}
                className="panel panel-interactive reveal rounded-card p-5 sm:p-6"
              >
                <div className="flex flex-col gap-x-4 gap-y-1.5 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-base font-semibold tracking-tight">
                    {role.title}
                    <span className="font-normal text-muted"> · {role.company}</span>
                  </h3>
                  <p className="shrink-0 font-mono text-xs text-muted">{role.dates}</p>
                </div>
                <p className="mt-2.5 max-w-[78ch] text-[0.9375rem] leading-[1.75] text-muted">
                  {role.line}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <hr className="rule" />

        {/* Technologies */}
        <section id="tech" className={`${shell} py-20 sm:py-28`}>
          <h2 className={`${heading} reveal`}>{content.sections.tech}</h2>

          <ul className="reveal mt-10 flex flex-wrap gap-2">
            {content.tech.map((tech) => (
              <li
                key={tech}
                className="panel rounded-tag px-3 py-1.5 text-[0.8125rem] text-ink transition-colors duration-200 hover:border-line-strong hover:text-accent"
              >
                {tech}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <hr className="rule" />

      {/* Contact */}
      <footer id="contact" className="ambient overflow-hidden">
        <div className={`${shell} py-20 sm:py-28`}>
          <h2 className={`${heading} reveal`}>{content.sections.contact}</h2>

          <a
            href={`mailto:${site.email}`}
            className="display-link reveal mt-8 inline-block text-2xl font-semibold tracking-[-0.02em] transition-opacity duration-200 hover:opacity-80 sm:text-3xl"
          >
            {site.email}
          </a>

          <ul className="reveal mt-8 flex flex-wrap gap-3">
            <li>
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary px-4 py-2.5 text-sm"
              >
                <GitHubIcon className="h-4 w-4" />
                {content.nav.github}
              </a>
            </li>
            <li>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary px-4 py-2.5 text-sm"
              >
                <LinkedInIcon className="h-4 w-4" />
                {content.nav.linkedin}
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}
