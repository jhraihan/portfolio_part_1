import { useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Github,
  Play,
} from 'lucide-react'

import { ArchitectureDiagram, hasDiagram } from '@/components/ArchitectureDiagram'
import { ImageFrame } from '@/components/ImageFrame'
import { Reveal } from '@/components/Reveal'
import { Spotlight } from '@/components/Spotlight'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { api } from '@/services/api'

/** Splits stored text on blank lines so paragraphs survive round-tripping. */
function Prose({ text }) {
  if (!text) return null
  return (
    <div className="space-y-4">
      {text
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index} className="prose-body text-pretty">
            {paragraph}
          </p>
        ))}
    </div>
  )
}

/** A numbered case study section. Renders nothing when its content is empty. */
function Section({ id, index, title, children, content }) {
  if (!content && !children) return null

  return (
    <Reveal id={id} className="scroll-mt-24 border-t border-line pt-10">
      <div className="flex items-baseline gap-3">
        {index && (
          <span className="font-mono text-xs tabular text-accent">
            {String(index).padStart(2, '0')}
          </span>
        )}
        <h2 className="text-heading font-semibold text-ink">{title}</h2>
      </div>
      <div className="mt-5">{children || <Prose text={content} />}</div>
    </Reveal>
  )
}

/** Turns a YouTube URL into its embed form. Returns null if unrecognised. */
function toYouTubeEmbed(url) {
  if (!url) return null
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  )
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export function ProjectDetail() {
  const { slug } = useParams()

  const { data: project, loading, error, refetch } = useApi(
    useCallback(() => api.getProject(slug), [slug]),
    [slug],
  )

  useDocumentTitle(project?.title, project?.summary)

  // Section numbers must count only the sections that actually render, so a
  // project missing a section does not leave a gap in the sequence.
  const numbered = useMemo(() => {
    if (!project) return {}
    const keys = []
    if (project.problem) keys.push('problem')
    if (project.solution) keys.push('solution')
    if (project.features?.length) keys.push('features')
    if (project.architecture || hasDiagram(project.slug)) keys.push('architecture')
    if (project.challenges) keys.push('challenges')
    if (project.lessons) keys.push('lessons')
    return Object.fromEntries(keys.map((key, i) => [key, i + 1]))
  }, [project])

  if (loading) {
    return (
      <div className="container-content section space-y-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-14 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="aspect-[16/9] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="section">
        <div className="container-content">
          <ErrorState
            message={
              error.status === 404
                ? 'That project does not exist.'
                : error.message
            }
            onRetry={error.status === 404 ? undefined : refetch}
          />
          <div className="mt-6 text-center">
            <Link to="/projects" className="btn-secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All projects
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!project) return null

  const {
    title,
    subtitle,
    summary,
    accent_label: accentLabel,
    status,
    is_solo: isSolo,
    role,
    technologies = [],
    features = [],
    images = [],
    problem,
    solution,
    architecture,
    challenges,
    lessons,
    github_url: githubUrl,
    live_url: liveUrl,
    video_url: videoUrl,
    cover_image: coverImage,
  } = project

  const embedUrl = toYouTubeEmbed(videoUrl)

  return (
    <article className="pb-section">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-line bg-surface">
        <div
          className="pointer-events-none absolute inset-0 bg-grid-sm opacity-40 mask-fade-b"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-accent/[0.06] blur-[120px]"
          aria-hidden="true"
        />

        <div className="container-content relative py-14 sm:py-20">
          <Reveal>
            <Link
              to="/projects"
              className="group inline-flex items-center gap-1.5 font-mono text-xs text-ink-faint transition-colors hover:text-ink"
            >
              <ArrowLeft
                className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
              Projects
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
              {accentLabel && (
                <span className="rounded border border-accent/40 bg-accent/[0.08] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
                  {accentLabel}
                </span>
              )}
              <span className="font-mono text-[11px] text-ink-faint">
                {isSolo ? 'Solo project' : 'Team project'}
              </span>
              {status === 'completed' && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-faint">
                  <Check className="h-3 w-3 text-green" aria-hidden="true" />
                  Completed
                </span>
              )}
            </div>

            <h1 className="mt-5 text-display font-bold text-ink">{title}</h1>
            <p className="mt-3 text-heading font-medium text-ink-muted text-balance">
              {subtitle}
            </p>
            <p className="prose-body mt-6 max-w-prose text-pretty">{summary}</p>

            {/* Rendered only when the corresponding URL exists, so an
                undeployed project shows no dead buttons. */}
            {(githubUrl || liveUrl || embedUrl) && (
              <div className="mt-9 flex flex-wrap gap-3">
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-primary"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Live demo
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-secondary"
                  >
                    <Github className="h-4 w-4" aria-hidden="true" />
                    Source code
                  </a>
                )}
                {embedUrl && (
                  <a href="#walkthrough" className="btn-ghost">
                    <Play className="h-4 w-4" aria-hidden="true" />
                    Watch walkthrough
                  </a>
                )}
              </div>
            )}
          </Reveal>
        </div>
      </header>

      <div className="container-content">
        <Reveal className="pt-12">
          <ImageFrame
            src={coverImage}
            alt={`${title} interface`}
            label="Screenshot"
            aspect="aspect-[16/9]"
            fit="contain"
            loading="eager"
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
          {/* Case study body. min-w-0 lets the column shrink below its
              content's intrinsic width, which grid children otherwise refuse
              to do — without it, long prose forces horizontal overflow. */}
          <div className="min-w-0 space-y-12">
            <Section index={numbered.problem} title="The problem" content={problem} />
            <Section index={numbered.solution} title="The approach" content={solution} />

            {features.length > 0 && (
              <Section index={numbered.features} title="Features">
                <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {features.map((feature) => (
                    <li key={feature.id} className="flex gap-3">
                      <Check
                        className="mt-1 h-3.5 w-3.5 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {feature.title}
                        </p>
                        {feature.description && (
                          <p className="mt-0.5 text-sm text-ink-faint text-pretty">
                            {feature.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {(architecture || hasDiagram(slug)) && (
              <Section index={numbered.architecture} title="Architecture">
                <ArchitectureDiagram slug={slug} className="mb-7" />
                <Prose text={architecture} />
              </Section>
            )}

            <Section
              index={numbered.challenges}
              title="Hardest problem"
              content={challenges}
            />
            <Section
              index={numbered.lessons}
              title="What I learned"
              content={lessons}
            />

            {embedUrl && (
              <Section title="Walkthrough">
                <div
                  id="walkthrough"
                  className="aspect-video overflow-hidden rounded-card border border-line bg-elevated"
                >
                  <iframe
                    src={embedUrl}
                    title={`${title} walkthrough`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="h-full w-full"
                  />
                </div>
              </Section>
            )}

            {images.length > 0 && (
              <Section title="Screenshots">
                <div className="grid gap-5 sm:grid-cols-2">
                  {images.map((image) => (
                    <figure key={image.id}>
                      {/* Screenshots are wide desktop captures, so the frame
                          matches their shape rather than cropping the sides. */}
                      <ImageFrame
                        src={image.image}
                        alt={image.alt_text}
                        aspect="aspect-[16/9]"
                        fit="contain"
                      />
                      {image.caption && (
                        <figcaption className="mt-2 font-mono text-xs text-ink-faint">
                          {image.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Spotlight className="card p-6">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                Stack
              </h2>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {technologies.map((tech) => (
                  <li key={tech.id} className="tag">
                    {tech.name}
                  </li>
                ))}
              </ul>

              {!isSolo && role && (
                <>
                  <h2 className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                    My role
                  </h2>
                  <p className="mt-3 text-sm text-ink-muted text-pretty">{role}</p>
                </>
              )}
            </Spotlight>
          </aside>
        </div>

        <Reveal className="mt-16 border-t border-line pt-10">
          <Link
            to="/projects"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-accent"
          >
            All projects
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </Reveal>
      </div>
    </article>
  )
}
