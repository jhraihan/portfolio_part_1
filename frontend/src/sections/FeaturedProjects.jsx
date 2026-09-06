import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { ProjectCard } from '@/components/ProjectCard'
import { SectionHeading } from '@/components/SectionHeading'
import { Reveal } from '@/components/Reveal'
import { ProjectCardSkeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'

export function FeaturedProjects({ projects, loading, error, onRetry }) {
  return (
    <section className="section" id="projects">
      <div className="container-content">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Selected work"
            title="Projects"
            description="Full applications built end to end — authentication, role-based access, API design, and the database underneath."
          />

          <Reveal delay={0.1}>
            <Link
              to="/projects"
              className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              All projects
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12">
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && !loading && (
            <ErrorState message={error.message} onRetry={onRetry} />
          )}

          {!loading && !error && projects?.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <Reveal key={project.id} delay={Math.min(index * 0.06, 0.3)}>
                  <ProjectCard project={project} index={index} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
