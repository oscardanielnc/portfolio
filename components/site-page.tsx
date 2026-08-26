import { site } from '@/content/site';
import type { Content } from '@/content/types';
import { Header } from './header';
import { ProjectCard, type Variant } from './project-card';
import { ArrowIcon, DownloadIcon, GitHubIcon, LinkedInIcon } from './icons';

const heading = 'text-2xl font-semibold tracking-tight sm:text-3xl';

/** Card composition per project, in the fixed order the projects are listed in.
    The two projects without a screenshot get the full-width text variant. */
const variants: readonly Variant[] = [
  'featured',
  'standard',
  'standard',
  'text',
  'featured-reverse',
  'text',
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

      <main id="main" className="pt-14">
        {/* Hero. Asymmetric 7/5 split so the second half carries real copy
            instead of empty space, and so the CTAs stay above the fold. */}
        <section className="hero-wash border-b border-line">
          <div className="mx-auto grid max-w-5xl gap-x-12 gap-y-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:py-24">
            <div className="lg:col-span-7">
              <p className="font-mono text-xs tracking-wide text-accent">{content.hero.location}</p>

              <h1 className="mt-5 text-[2rem] font-semibold leading-[1.05] tracking-[-0.02em] text-balance sm:text-5xl">
                {site.name}
              </h1>

              <p className="mt-4 text-lg font-medium text-muted sm:text-xl">
                {content.hero.headline}
              </p>

              {lead && (
                <p className="mt-7 max-w-[58ch] text-[0.9375rem] leading-[1.75] text-muted sm:text-base">
                  {lead}
                </p>
              )}

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 rounded-control bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-opacity duration-200 hover:opacity-85 active:translate-y-px"
                >
                  {content.hero.primaryCta}
                  <ArrowIcon className="h-4 w-4" />
                </a>
                <a
                  href={content.cvHref}
                  download
                  className="inline-flex items-center gap-2 rounded-control border border-line-strong px-5 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-hover active:translate-y-px"
                >
                  <DownloadIcon className="h-4 w-4" />
                  {content.hero.secondaryCta}
                </a>
              </div>
            </div>

            <div className="flex flex-col justify-end space-y-5 border-t border-line pt-8 lg:col-span-5 lg:border-l lg:border-t-0 lg:pb-1 lg:pl-12 lg:pt-1">
              {rest.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="max-w-[52ch] text-[0.875rem] leading-[1.8] text-muted"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="border-b border-line">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className={heading}>{content.sections.projects}</h2>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {content.projects.map((project, index) => (
                <ProjectCard
                  key={project.name}
                  project={project}
                  labels={content.projectLabels}
                  variant={variants[index] ?? 'standard'}
                />
              ))}
            </div>

            <p className="mt-8 max-w-[75ch] text-sm leading-[1.75] text-muted">
              {content.alsoBuilt}
            </p>
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="border-b border-line">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className={heading}>{content.sections.experience}</h2>

            <ol className="mt-10 border-l border-line">
              {content.experience.map((role) => (
                <li key={`${role.company}-${role.dates}`} className="relative py-5 pl-6 first:pt-0">
                  <span
                    aria-hidden="true"
                    className="absolute -left-px top-[1.85rem] h-px w-4 bg-line-strong first:top-2"
                  />
                  <div className="flex flex-col gap-x-4 gap-y-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-base font-semibold tracking-tight">
                      {role.title}
                      <span className="font-normal text-muted"> · {role.company}</span>
                    </h3>
                    <p className="shrink-0 font-mono text-xs text-muted">{role.dates}</p>
                  </div>
                  <p className="mt-2 max-w-[75ch] text-[0.9375rem] leading-[1.7] text-muted">
                    {role.line}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Technologies */}
        <section id="tech" className="border-b border-line">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className={heading}>{content.sections.tech}</h2>

            <ul className="mt-10 flex flex-wrap gap-2">
              {content.tech.map((tech) => (
                <li
                  key={tech}
                  className="rounded-tag border border-line bg-surface px-3 py-1.5 text-[0.8125rem] text-ink transition-colors duration-200 hover:border-line-strong"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* Contact */}
      <footer id="contact" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className={heading}>{content.sections.contact}</h2>

        <ul className="mt-8 space-y-4">
          <li>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2.5 text-lg text-ink underline decoration-line-strong underline-offset-[6px] transition-colors duration-200 hover:text-accent hover:decoration-accent sm:text-xl"
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
