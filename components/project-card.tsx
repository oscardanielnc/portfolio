import type { Content, Project } from '@/content/types';
import { ExternalIcon } from './icons';

interface Props {
  project: Project;
  labels: Content['projectLabels'];
}

export function ProjectCard({ project, labels }: Props) {
  return (
    <article className="flex flex-col rounded-xl border border-line bg-surface p-5 transition-colors duration-200 hover:border-line-strong sm:p-6">
      <h3 className="text-lg font-semibold tracking-tight">
        {project.name}
        <span className="ml-2 align-middle text-sm font-normal text-muted">{project.kind}</span>
      </h3>

      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink">{project.summary}</p>

      <p className="mt-3 text-[0.875rem] leading-[1.7] text-muted">{project.detail}</p>

      <h4 className="sr-only">{`${labels.stack} — ${project.name}`}</h4>
      <ul className="mt-5 flex flex-wrap gap-1.5">
        {project.tech.map((tech) => (
          <li
            key={tech}
            className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.6875rem] leading-5 text-muted"
          >
            {tech}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
        {project.demo ? (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-opacity duration-200 hover:opacity-85"
          >
            {labels.live}
            <ExternalIcon className="h-3.5 w-3.5" />
            <span className="sr-only">{`— ${project.name}`}</span>
          </a>
        ) : (
          <span className="inline-flex items-center rounded-lg border border-dashed border-line-strong px-4 py-2 text-sm font-medium text-muted">
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
    </article>
  );
}
