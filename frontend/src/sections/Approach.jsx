import { Database, GitBranch, Layers, ShieldCheck } from 'lucide-react'

import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { Spotlight } from '@/components/Spotlight'

// Each item describes something visible in the five projects. Nothing here is
// aspirational — every claim is backed by shipped code.
const PILLARS = [
  {
    Icon: Layers,
    title: 'Decoupled by default',
    body: 'A React client that holds no server state, talking to a REST API that owns all of it. Every project is built this way, which keeps the contract between frontend and backend explicit.',
    tone: 'text-cyan',
  },
  {
    Icon: ShieldCheck,
    title: 'Permissions at the API',
    body: 'Access rules live on the server, not in the interface. A hidden button is a design choice; a scoped queryset is a security boundary. MicroMart, EduFlow, and MediDesk all enforce roles at the API layer.',
    tone: 'text-accent',
  },
  {
    Icon: Database,
    title: 'Schema before features',
    body: 'The database shape decides what the application can do later. I design relations and constraints first, then build against them — across MySQL, PostgreSQL, and SQLite.',
    tone: 'text-green',
  },
  {
    Icon: GitBranch,
    title: 'State machines over flags',
    body: 'Orders, appointments, and submissions each move through defined states. Getting those transitions right is what stops a system ending up in a half-finished condition.',
    tone: 'text-violet',
  },
]

export function Approach() {
  return (
    <section className="section relative border-t border-line">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-sm opacity-[0.35] mask-fade-b"
        aria-hidden="true"
      />

      <div className="container-content">
        <SectionHeading
          eyebrow="How I build"
          title="Systems, not screens"
          description="The same four decisions shape every project below. They are the reason these are applications rather than demos."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} delay={Math.min(index * 0.07, 0.28)}>
              <Spotlight className="card h-full p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-elevated">
                    <pillar.Icon
                      className={`h-4 w-4 ${pillar.tone}`}
                      aria-hidden="true"
                      strokeWidth={1.75}
                    />
                  </span>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink">{pillar.title}</h3>
                    <p className="prose-body mt-2.5 text-sm text-pretty">
                      {pillar.body}
                    </p>
                  </div>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
