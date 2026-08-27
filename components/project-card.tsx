import type { Content, Project } from '@/content/types';
import { ExternalIcon } from './icons';

export type Variant = 'featured' | 'featured-reverse' | 'standard' | 'text';

interface Props {
  project: Project;
  labels: Content['projectLabels'];
  variant: Variant;
}

/**
 * The grid rhythm follows the content, not a template. Projects with a screenshot get a
 * plate; the two without one become full-width text cards so they never sit beside an
 * image card and leave the row misaligned.
 *
 *  featured / featured-reverse  full width, plate on one side, mirrored between the two
 *  standard                     half width, plate on top
 *  text                         full width, copy left and actions right, no plate
 */
export function ProjectCard({ project, labels, variant }: Props) {
  const isFeatured = variant === 'featured' || variant === 'featured-reverse';
  const plate = project.image ? (
    <Plate project={project} alt={`${labels.screenshot} ${project.name}`} variant={variant} />
  ) : null;

  return (
    <article
      className={[
        'panel panel-interactive reveal flex flex-col overflow-hidden rounded-card',
        variant !== 'standard' ? 'md:col-span-2' : '',
        variant === 'featured' ? 'md:flex-row' : '',
        variant === 'featured-reverse' ? 'md:flex-row-reverse' : '',
      ].join(' ')}
    >
      {plate}

      <div
        className={[
          'flex flex-1 flex-col p-5 sm:p-7',
          isFeatured ? 'md:w-[46%] md:shrink-0' : '',
          variant === 'text' ? 'md:flex-row md:items-start md:gap-10' : '',
        ].join(' ')}
      >
        <div className={variant === 'text' ? 'md:flex-1' : ''}>
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{project.name}</h3>
            <span className="text-sm text-muted">{project.kind}</span>
          </div>

          <p className="mt-2.5 max-w-[68ch] text-[0.9375rem] leading-relaxed text-ink">
            {project.summary}
          </p>

          <p className="mt-3 max-w-[72ch] text-[0.875rem] leading-[1.75] text-muted">
            {project.detail}
          </p>
        </div>

        <div
          className={[
            'flex flex-col',
            variant === 'text' ? 'mt-6 md:mt-0 md:w-[15rem] md:shrink-0' : 'flex-1',
          ].join(' ')}
        >
          <h4 className="sr-only">{`${labels.stack} — ${project.name}`}</h4>
          <ul className={`flex flex-wrap gap-1.5 ${variant === 'text' ? '' : 'mt-6'}`}>
            {project.tech.map((tech) => (
              <li
                key={tech}
                className="rounded-tag border border-line bg-tag px-2 py-0.5 font-mono text-[0.6875rem] leading-5 text-muted"
              >
                {tech}
              </li>
            ))}
          </ul>

          <div
            className={`flex flex-wrap items-center gap-x-5 gap-y-3 pt-7 ${
              variant === 'text' ? '' : 'mt-auto'
            }`}
          >
            {project.demo ? (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary px-4 py-2.5 text-sm"
              >
                {labels.live}
                <ExternalIcon className="h-3.5 w-3.5" />
                <span className="sr-only">{`— ${project.name}`}</span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-control border border-dashed border-line-strong px-4 py-2.5 text-sm font-medium text-muted">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                {labels.archived}
              </span>
            )}

            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:text-accent hover:decoration-accent"
              >
                {labels.code}
                <span className="sr-only">{`— ${project.name}`}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Fixed 16:10 plate, cropped from the top so the app chrome stays readable, inset
 * slightly so the screenshot reads as a framed window rather than a bleeding edge.
 */
function Plate({ project, alt, variant }: { project: Project; alt: string; variant: Variant }) {
  const image = project.image;
  if (!image) return null;

  const isFeatured = variant === 'featured' || variant === 'featured-reverse';

  return (
    <div
      className={[
        'relative shrink-0 p-3 sm:p-4',
        isFeatured ? 'md:flex-1 md:p-5' : '',
      ].join(' ')}
    >
      <div className="h-full overflow-hidden rounded-[10px] border border-line bg-bg shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)]">
        <img
          src={image.src}
          srcSet={`${image.src.replace('.webp', '@sm.webp')} ${Math.round(image.width / 2)}w, ${image.src} ${image.width}w`}
          sizes={isFeatured ? '(min-width: 768px) 34rem, 100vw' : '(min-width: 768px) 32rem, 100vw'}
          width={image.width}
          height={image.height}
          alt={alt}
          loading="lazy"
          decoding="async"
          // Below the fold and never the LCP element: keep them off the critical path.
          fetchPriority="low"
          className="aspect-[16/10] h-full w-full object-cover object-top"
        />
      </div>
    </div>
  );
}
