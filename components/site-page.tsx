import { site } from '@/content/site';
import type { Content } from '@/content/types';
import { Header } from './header';
import { ProjectCard } from './project-card';
import { ArrowIcon, DownloadIcon, GitHubIcon, LinkedInIcon } from './icons';

const sectionTitle =
  'text-xs font-semibold uppercase tracking-[0.18em] text-muted';

export function SitePage({ content }: { content: Content }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
      >
        {content.nav.skipToContent}
      </a>

      <Header content={content} />

      <main id="main" className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
        {/* Hero */}
        <section className="border-b border-line py-16 sm:py-24">
          <p className="font-mono text-xs tracking-wide text-accent">{content.hero.location}</p>

          <h1 className="mt-5 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-[2.75rem]">
            {site.name}
          </h1>

          <p className="mt-3 text-lg font-medium text-muted sm:text-xl">{content.hero.headline}</p>

          <div className="mt-8 max-w-[62ch] space-y-4 text-[0.9375rem] leading-[1.75] text-muted sm:text-base">
            {content.hero.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity duration-200 hover:opacity-85"
            >
              {content.hero.primaryCta}
              <ArrowIcon className="h-4 w-4" />
            </a>
            <a
              href={site.cv}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-hover"
            >
              <DownloadIcon className="h-4 w-4" />
              {content.hero.secondaryCta}
            </a>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="border-b border-line py-16 sm:py-20">
          <h2 className={sectionTitle}>{content.sections.projects}</h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {content.projects.map((project) => (
              <ProjectCard key={project.name} project={project} labels={content.projectLabels} />
            ))}
          </div>

          <p className="mt-6 max-w-[70ch] text-sm leading-[1.7] text-muted">{content.alsoBuilt}</p>
        </section>

        {/* Experience */}
        <section id="experience" className="border-b border-line py-16 sm:py-20">
          <h2 className={sectionTitle}>{content.sections.experience}</h2>

          <ol className="mt-8 space-y-8">
            {content.experience.map((role) => (
              <li key={`${role.company}-${role.dates}`}>
                <div className="flex flex-col gap-x-3 gap-y-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-base font-semibold tracking-tight">
                    {role.title}
                    <span className="text-muted"> · </span>
                    <span className="font-normal text-muted">{role.company}</span>
                  </h3>
                  <p className="shrink-0 font-mono text-xs text-muted">{role.dates}</p>
                </div>
                <p className="mt-1.5 max-w-[72ch] text-[0.9375rem] leading-[1.7] text-muted">
                  {role.line}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Technologies */}
        <section id="tech" className="border-b border-line py-16 sm:py-20">
          <h2 className={sectionTitle}>{content.sections.tech}</h2>

          <ul className="mt-8 flex flex-wrap gap-2">
            {content.tech.map((tech) => (
              <li
                key={tech}
                className="rounded-md border border-line bg-surface px-2.5 py-1 text-[0.8125rem] text-ink"
              >
                {tech}
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* Contact */}
      <footer id="contact" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className={sectionTitle}>{content.sections.contact}</h2>

        <ul className="mt-6 space-y-3">
          <li>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2.5 text-base text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:text-accent hover:decoration-accent"
            >
              {site.email}
            </a>
          </li>
          <li>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-base text-muted transition-colors duration-200 hover:text-accent"
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
              className="inline-flex items-center gap-2.5 text-base text-muted transition-colors duration-200 hover:text-accent"
            >
              <LinkedInIcon className="h-4 w-4" />
              {content.nav.linkedin}
            </a>
          </li>
        </ul>
      </footer>
    </>
  );
}
