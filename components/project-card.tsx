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
        'flex flex-col overflow-hidden rounded-card border border-line bg-surface',
        'transition-colors duration-200 hover:border-line-strong',
        variant !== 'standard' ? 'md:col-span-2' : '',
        variant === 'featured' ? 'md:flex-row' : '',
        variant === 'featured-reverse' ? 'md:flex-row-reverse' : '',
      ].join(' ')}
    >
      {variant === 'standard' && plate}
      {isFeatured && plate}

      <div
        className={[
          'flex flex-1 flex-col p-5 sm:p-6',
          isFeatured ? 'md:w-[46%] md:shrink-0' : '',
          variant === 'text' ? 'md:flex-row md:items-start md:gap-10' : '',
        ].join(' ')}
      >
        <div className={variant === 'text' ? 'md:flex-1' : ''}>
          <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
            {project.name}
            <span className="ml-2 align-middle text-sm font-normal text-muted">{project.kind}</span>
          </h3>

          <p className="mt-2 max-w-[68ch] text-[0.9375rem] leading-relaxed text-ink">
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
          <ul className={`flex flex-wrap gap-1.5 ${variant === 'text' ? '' : 'mt-5'}`}>
            {project.tech.map((tech) => (
              <li
                key={tech}
                className="rounded-tag border border-line px-1.5 py-0.5 font-mono text-[0.6875rem] leading-5 text-muted"
              >
                {tech}
              </li>
            ))}
          </ul>

          <div
            className={`flex flex-wrap items-center gap-x-5 gap-y-3 pt-6 ${
              variant === 'text' ? '' : 'mt-auto'
            }`}
          >
            {project.demo ? (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-control bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-opacity duration-200 hover:opacity-85 active:translate-y-px"
              >
                {labels.live}
                <ExternalIcon className="h-3.5 w-3.5" />
                <span className="sr-only">{`— ${project.name}`}</span>
              </a>
            ) : (
              <span className="inline-flex items-center rounded-control border border-dashed border-line-strong px-4 py-2.5 text-sm font-medium text-muted">
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

/** Fixed 16:10 plate, cropped from the top so the app chrome stays readable. */
function Plate({
  project,
  alt,
  variant,
}: {
  project: Project;
  alt: string;
  variant: Variant;
}) {
  const image = project.image;
  if (!image) return null;

  const isFeatured = variant === 'featured' || variant === 'featured-reverse';

  return (
    <div
      className={[
        'aspect-[16/10] shrink-0 overflow-hidden bg-surface-hover',
        isFeatured
          ? 'border-b border-line md:aspect-auto md:flex-1 md:border-b-0'
          : 'border-b border-line',
        variant === 'featured' ? 'md:border-l' : '',
        variant === 'featured-reverse' ? 'md:border-r' : '',
      ].join(' ')}
    >
      <img
        src={image.src}
        srcSet={`${image.src.replace('.webp', '@sm.webp')} ${Math.round(image.width / 2)}w, ${image.src} ${image.width}w`}
        sizes={isFeatured ? '(min-width: 768px) 34rem, 100vw' : '(min-width: 768px) 32rem, 100vw'}
        width={image.width}
        height={image.height}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover object-top"
      />
    </div>
  );
}
