import { Link } from 'react-router-dom'
import { ArrowUpRight, Github, ExternalLink } from 'lucide-react'

import { ImageFrame } from './ImageFrame'
import { Spotlight } from './Spotlight'

const MAX_VISIBLE_TECH = 4

export function ProjectCard({ project, index = 0 }) {
  const {
    slug,
    title,
    subtitle,
    summary,
    accent_label: accentLabel,
    technologies = [],
    cover_image: coverImage,
    github_url: githubUrl,
    live_url: liveUrl,
  } = project

  const visibleTech = technologies.slice(0, MAX_VISIBLE_TECH)
  const remainingCount = technologies.length - visibleTech.length
  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <Spotlight
      as="article"
      className="card-interactive group relative flex h-full flex-col overflow-hidden"
    >
      <div className="relative">
        <ImageFrame
          src={coverImage}
          alt={`${title} preview`}
          label={accentLabel || 'Preview'}
          aspect="aspect-[16/9]"
          className="rounded-none border-0 border-b border-line"
          loading={index < 2 ? 'eager' : 'lazy'}
        />

        {/* Index marker, in the style of a numbered figure. */}
        <span className="absolute left-4 top-4 rounded border border-line bg-canvas/80 px-1.5 py-0.5 font-mono text-[10px] text-ink-faint backdrop-blur-sm">
          {indexLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        {accentLabel && (
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            {accentLabel}
          </p>
        )}

        <h3 className="mt-2 flex items-start justify-between gap-3 text-heading font-semibold text-ink">
          {/* The whole card is clickable via this stretched link, which keeps
              one focusable target for keyboard users. */}
          <Link
            to={`/projects/${slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
          <ArrowUpRight
            className="mt-1 h-4 w-4 shrink-0 text-ink-faint transition-all duration-300 group-hover/spot:-translate-y-0.5 group-hover/spot:translate-x-0.5 group-hover/spot:text-accent"
            aria-hidden="true"
          />
        </h3>

        <p className="mt-1 text-sm text-ink-faint">{subtitle}</p>
        <p className="prose-body mt-4 line-clamp-3 flex-1 text-sm text-pretty">
          {summary}
        </p>

        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies used">
          {visibleTech.map((tech) => (
            <li key={tech.id} className="tag">
              {tech.name}
            </li>
          ))}
          {remainingCount > 0 && (
            <li className="tag border-dashed text-ink-faint">+{remainingCount}</li>
          )}
        </ul>

        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <span className="font-mono text-xs text-ink-muted transition-colors group-hover/spot:text-accent">
            Read case study
          </span>

          {/* Sits above the stretched link so these remain independently
              clickable. Rendered only when the URL exists. */}
          <div className="relative z-10 flex items-center gap-1">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-md p-1.5 text-ink-faint transition-colors hover:text-ink"
                aria-label={`${title} source on GitHub`}
              >
                <Github className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-md p-1.5 text-ink-faint transition-colors hover:text-ink"
                aria-label={`${title} live demo`}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </Spotlight>
  )
}
