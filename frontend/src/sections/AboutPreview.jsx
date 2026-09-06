import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap } from 'lucide-react'

import { SectionHeading } from '@/components/SectionHeading'
import { Reveal } from '@/components/Reveal'
import { Spotlight } from '@/components/Spotlight'

export function AboutPreview({ profile, education }) {
  if (!profile?.about_short) return null

  return (
    <section className="section" id="about">
      <div className="container-content">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Background" title="About" />

            <Reveal delay={0.08}>
              <p className="prose-body mt-6 text-pretty">{profile.about_short}</p>

              <Link
                to="/about"
                className="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-accent"
              >
                More about me
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          </div>

          {education?.length > 0 && (
            <Reveal delay={0.14}>
              <Spotlight className="card p-6 sm:p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                  Education
                </p>

                {education.map((item) => (
                  <div key={item.id} className="mt-6 first:mt-6">
                    <div className="flex items-start gap-3">
                      <GraduationCap
                        className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint"
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="font-medium text-ink">{item.degree}</h3>
                        <p className="mt-1 text-sm text-ink-muted">
                          {item.institution}
                        </p>
                        <p className="mt-2 font-mono text-xs text-ink-faint">
                          {item.date_range}
                          {item.status_note && ` · ${item.status_note}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </Spotlight>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
