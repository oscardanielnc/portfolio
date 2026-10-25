import { site, techGroups } from '@/content/site';
import type { Content, Project, SectionId } from '@/content/types';
import { LanguageSwitch } from './language-switch';

/**
 * The whole site is this one page, rendered to static HTML.
 *
 * Without JavaScript it reads top to bottom: name, the four sections, contact. With it,
 * stage/main.ts turns the same markup into the avatar stage: the wheel links open each
 * section in a full-screen panel through a portal, and the avatar keeps you company from
 * its dock. Nothing here depends on that script, so search engines and readers with
 * JavaScript off get every word.
 */

export const SECTIONS: readonly SectionId[] = ['about', 'projects', 'experience', 'stack'];
/** Light of each section on the floor ring of the stage. */
const SECTION_COLORS = ['#9CCBFF', '#7FD6F2', '#86A8FF', '#B4D8FF'];

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Section title with its last letter in the accent colour. */
function Title({ label }: { label: string }) {
  return (
    <>
      {label.slice(0, -1)}
      <span>{label.slice(-1)}</span>
    </>
  );
}

function Pill({ href, children, ghost, download }: { href: string; children: React.ReactNode; ghost?: boolean; download?: boolean }) {
  const external = href.startsWith('http');
  return (
    <a
      className={ghost ? 'pill ghost' : 'pill'}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...(download ? { download: true } : {})}
    >
      {children}
    </a>
  );
}

function SectionHead({ index, content }: { index: number; content: Content }) {
  const id = SECTIONS[index]!;
  return (
    <>
      <div className="eyebrow">
        <span>
          <b>{pad2(index + 1)}</b> / {pad2(SECTIONS.length)}
        </span>
        <span className="cue">{content.ui.scrollCue}</span>
      </div>
      <h2 className="sec-title" tabIndex={-1}>
        <Title label={content.ui.sections[id]} />
      </h2>
    </>
  );
}

function NextLink({ index, content }: { index: number; content: Content }) {
  const n = (index + 1) % SECTIONS.length;
  const id = SECTIONS[n]!;
  return (
    <a className="next" href={`#${id}`} data-go={n}>
      <small>
        {content.ui.next} · <b>{pad2(n + 1)}</b> / {pad2(SECTIONS.length)}
      </small>
      <strong>{content.ui.sections[id]}</strong>
      <em>{content.ui.nextLines[id]}</em>
      <span className="go" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10h12M11 5l5 5-5 5" />
        </svg>
      </span>
    </a>
  );
}

function ProjectBlock({ project, index, content }: { project: Project; index: number; content: Content }) {
  const l = content.projectLabels;
  const video = project.video;
  const tag = project.demo ? content.ui.liveTag : project.archived ? l.archived : l.noDemo;
  return (
    <article className="proj" id={`project-${index + 1}`} data-anchor={project.name}>
      <figure className="media">
        <div className={video?.fit === 'contain' ? 'card contain' : 'card'}>
          {video && (
            // Plain HTML player: with the stage script it plays only while on screen,
            // without it the visitor gets the controls. preload="none" until then.
            <video
              muted
              loop
              playsInline
              controls
              preload="none"
              poster={video.poster}
              width={video.width}
              height={video.height}
              data-sm={video.src.replace(/\.mp4$/, '@sm.mp4')}
              aria-label={`${l.recording} ${project.name}`}
            >
              <source src={video.src} type="video/mp4" />
            </video>
          )}
          <span className="tag">{tag}</span>
        </div>
      </figure>
      <div className="txt">
        <div className="top">
          <b>{pad2(index + 1)}</b>
          <span>{project.kind}</span>
          {project.featured && <span className="badge featured">{l.featured}</span>}
          {project.archived && <span className="badge">{l.archived}</span>}
        </div>
        <h3>{project.name}</h3>
        <p className="sum">{project.summary}</p>
        <p className="det">{project.detail}</p>
        <div className="meta">
          <h4>{l.stack}</h4>
          <ul className="chips">
            {project.tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="ctas">
          {project.demo && <Pill href={project.demo}>{l.live}</Pill>}
          {project.walkthrough && <Pill href={project.walkthrough}>{l.watch}</Pill>}
          {project.repo && (
            <Pill href={project.repo} ghost>
              {l.code}
            </Pill>
          )}
        </div>
      </div>
    </article>
  );
}

function ContactLinks({ content }: { content: Content }) {
  return (
    <div className="contact">
      <span className="mail">
        <span>{site.email}</span>
        <button type="button" data-copy hidden>
          {content.ui.copy}
        </button>
      </span>
      <a className="mail-link" href={`mailto:${site.email}`}>
        {content.ui.email}
      </a>
      <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
        {content.nav.linkedin}
      </a>
      <a href={site.github} target="_blank" rel="noopener noreferrer">
        {content.nav.github}
      </a>
      <a href={content.cvHref} download>
        {content.ui.cv}
      </a>
    </div>
  );
}

export function SitePage({ content, model, stageScript }: { content: Content; model: string; stageScript: string }) {
  const ui = content.ui;
  const [lead, second, third] = content.hero.intro;
  const sectionLinks = (className?: string) =>
    SECTIONS.map((id, i) => (
      <a key={id} className={className} href={`#${id}`} data-go={i}>
        {ui.sections[id]}
      </a>
    ));
  const stageData = {
    model,
    colors: SECTION_COLORS,
    copy: ui.copy,
    copied: ui.copied,
    selected: ui.selected,
    email: site.email,
  };

  return (
    <>
      <a className="skip" href="#main">
        {content.nav.skipToContent}
      </a>

      <canvas id="stage" aria-hidden="true" />

      <header className="top">
        <div>
          <h1 className="name">{site.shortName}</h1>
          <p className="role">{content.hero.headline}</p>
        </div>
        <LanguageSwitch content={content} />
      </header>

      <nav id="wheel" aria-label={ui.sectionsNav}>
        {sectionLinks()}
      </nav>
      <p id="hint">{ui.hint}</p>
      <p id="loading" role="status">
        <span>{ui.loading}</span>
      </p>

      <div id="portalRing" aria-hidden="true" />

      <main id="main">
        <div id="panel">
          <aside className="rail">
            <div className="rail-top">
              <button className="back" type="button" data-back hidden>
                ← {ui.back}
              </button>
              <LanguageSwitch content={content} />
            </div>
            <div className="who">
              <b>{site.shortName}</b>
              <span>{content.hero.headline}</span>
            </div>
            <nav className="secnav" aria-label={ui.sectionsNav}>
              {sectionLinks()}
            </nav>
            <div className="index" id="railIndex" hidden />
          </aside>

          <div className="scroller" id="scroller" tabIndex={-1}>
            <div className="topbar">
              <button className="back" type="button" data-back aria-label={ui.back} hidden>
                ←
              </button>
              {sectionLinks('tab')}
              <LanguageSwitch content={content} />
            </div>

            <div className="content">
              {/* About */}
              <section className="sec" id="about" data-sec={0}>
                <SectionHead index={0} content={content} />
                <div className="intro">
                  <div>
                    <p className="big">{lead}</p>
                    <p>{second}</p>
                    <p>{third}</p>
                    <div className="ctas">
                      <a className="pill" href="#projects" data-go={1}>
                        {content.hero.primaryCta}
                      </a>
                      <Pill href={content.cvHref} ghost download>
                        {content.hero.secondaryCta}
                      </Pill>
                    </div>
                  </div>
                  <div className="meta">
                    <h4>{ui.role}</h4>
                    <p>{content.hero.headline}</p>
                    <h4>{ui.location}</h4>
                    <p>{content.hero.location}</p>
                    <h4>{ui.core}</h4>
                    <ul>
                      <li>React</li>
                      <li>Next.js</li>
                      <li>TypeScript</li>
                    </ul>
                  </div>
                </div>
                <section className="how" aria-labelledby="how-title">
                  <h3 id="how-title">{content.howIWork.title}</h3>
                  <ul>
                    {content.howIWork.items.map((item) => (
                      <li key={item.title}>
                        <h4>{item.title}</h4>
                        <p>{item.line}</p>
                      </li>
                    ))}
                  </ul>
                </section>
                <NextLink index={0} content={content} />
              </section>

              {/* Projects */}
              <section className="sec" id="projects" data-sec={1} data-index-title={ui.sections.projects}>
                <SectionHead index={1} content={content} />
                <div className="intro">
                  <div>
                    <p className="big">{second}</p>
                  </div>
                  <div className="meta">
                    <h4>{ui.projectsCount.replace('{n}', String(content.projects.length))}</h4>
                    <p>{ui.projectsNote}</p>
                  </div>
                </div>
                {content.projects.map((project, i) => (
                  <ProjectBlock key={project.name} project={project} index={i} content={content} />
                ))}
                <p className="also">{content.alsoBuilt}</p>
                <NextLink index={1} content={content} />
              </section>

              {/* Experience */}
              <section className="sec" id="experience" data-sec={2} data-index-title={ui.sections.experience}>
                <SectionHead index={2} content={content} />
                <div className="intro">
                  <div>
                    <p className="big">{lead}</p>
                    <div className="ctas">
                      <Pill href={content.cvHref} download>
                        {content.nav.cv}
                      </Pill>
                      <Pill href={site.linkedin} ghost>
                        {content.nav.linkedin}
                      </Pill>
                    </div>
                  </div>
                  <div className="meta">
                    <h4>{ui.location}</h4>
                    <p>{content.hero.location}</p>
                  </div>
                </div>
                <ol className="jobs">
                  {content.experience.map((role) => (
                    <li key={`${role.company}-${role.dates}`} data-anchor={role.company.replace(/ \(.*\)/, '')}>
                      <div className="dates">{role.dates}</div>
                      <div>
                        <h3>{role.title}</h3>
                        <div className="co">{role.company}</div>
                        <p>{role.line}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <NextLink index={2} content={content} />
              </section>

              {/* Stack */}
              <section className="sec" id="stack" data-sec={3} data-index-title={ui.layers}>
                <SectionHead index={3} content={content} />
                <div className="intro">
                  <div>
                    <p className="big">{ui.stackLede}</p>
                  </div>
                  <div className="meta">
                    <h4>{ui.whereToSee}</h4>
                    <p>{ui.whereToSeeLine}</p>
                    <div className="ctas tight">
                      <a className="pill ghost" href="#projects" data-go={1}>
                        {content.hero.primaryCta}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="groups">
                  {techGroups.map((g) => (
                    <section key={g.id} className="group" data-anchor={ui.techGroups[g.id]}>
                      <h3>{ui.techGroups[g.id]}</h3>
                      <ul className="chips">
                        {g.items.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
                <NextLink index={3} content={content} />
              </section>
            </div>
          </div>
        </div>
      </main>

      <footer id="contact">
        <p className="lead">
          {ui.footerLead[0]} <span>{ui.footerLead[1]}</span>
        </p>
        <ContactLinks content={content} />
      </footer>

      <script
        type="application/json"
        id="stage-data"
        // Build-time constants, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stageData) }}
      />
      <script type="module" src={stageScript} />
    </>
  );
}
