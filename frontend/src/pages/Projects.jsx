import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/Reveal'
import { ProjectCardSkeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { api } from '@/services/api'

// Only technologies worth filtering by. Listing all 34 turns the filter into
// a wall of buttons that nobody reads.
const FILTER_PRIORITY = [
  'django',
  'django-rest-framework',
  'react',
  'mysql',
  'postgresql',
  'python',
  'javascript',
  'jwt',
  'tailwind-css',
]

export function Projects() {
  useDocumentTitle(
    'Projects',
    'Full-stack applications built with Django, Django REST Framework, React, and MySQL.',
  )

  // The active filter lives in the URL, so a filtered view is shareable and
  // survives a refresh or a back navigation.
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTech = searchParams.get('tech') || ''

  const {
    data: projects,
    loading,
    error,
    refetch,
  } = useApi(
    useCallback(
      () => api.getProjects(activeTech ? { tech: activeTech } : {}),
      [activeTech],
    ),
    [activeTech],
  )

  const { data: technologies } = useApi(
    useCallback(() => api.getTechnologies(), []),
    [],
  )

  const filters = useMemo(() => {
    if (!technologies) return []
    const bySlug = new Map(technologies.map((t) => [t.slug, t]))
    return FILTER_PRIORITY.map((slug) => bySlug.get(slug)).filter(Boolean)
  }, [technologies])

  const setFilter = (slug) => {
    setSearchParams(slug ? { tech: slug } : {})
  }

  return (
    <div className="section">
      <div className="container-content">
        <Reveal>
          <p className="eyebrow">
            <span className="h-px w-6 bg-accent" aria-hidden="true" />
            Work
          </p>
          <h1 className="mt-4 text-display font-bold text-ink">Projects</h1>
          <p className="prose-body mt-5 max-w-prose text-pretty">
            Five applications, each built end to end. Every one handles
            authentication, role-based access, and a relational schema behind a
            REST API — and each case study covers the architecture and the
            hardest problem it presented.
          </p>
        </Reveal>

        {filters.length > 0 && (
          <Reveal delay={0.08}>
            <div
              className="mt-10 flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter by technology"
            >
              <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                Filter
              </span>

              <button
                type="button"
                onClick={() => setFilter('')}
                aria-pressed={!activeTech}
                className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
                  !activeTech
                    ? 'border-accent bg-accent/[0.08] text-ink'
                    : 'border-line text-ink-muted hover:border-line-strong hover:text-ink'
                }`}
              >
                All
              </button>

              {filters.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setFilter(tech.slug)}
                  aria-pressed={activeTech === tech.slug}
                  className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
                    activeTech === tech.slug
                      ? 'border-accent bg-accent/[0.08] text-ink'
                      : 'border-line text-ink-muted hover:border-line-strong hover:text-ink'
                  }`}
                >
                  {tech.name}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        <div className="mt-12" aria-live="polite">
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && !loading && (
            <ErrorState message={error.message} onRetry={refetch} />
          )}

          {!loading && !error && projects?.length === 0 && (
            <div className="rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center">
              <p className="text-ink">No projects use that technology.</p>
              <button
                type="button"
                onClick={() => setFilter('')}
                className="btn-secondary mt-5"
              >
                Show all projects
              </button>
            </div>
          )}

          {!loading && !error && projects?.length > 0 && (
            <>
              <p className="mb-6 font-mono text-xs text-ink-faint">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                {activeTech && ' matching filter'}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => (
                  <Reveal key={project.id} delay={Math.min(index * 0.05, 0.25)}>
                    <ProjectCard project={project} index={index} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
