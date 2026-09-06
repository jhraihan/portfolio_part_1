import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Download, GraduationCap, MapPin } from 'lucide-react'

import { Reveal } from '@/components/Reveal'
import { Spotlight } from '@/components/Spotlight'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { api } from '@/services/api'

export function About({ profile }) {
  useDocumentTitle(
    'About',
    profile?.about_short ||
      'Software engineer building full-stack web applications.',
  )

  const { data: education } = useApi(
    useCallback(() => api.getEducation(), []),
    [],
  )

  const { data: skills } = useApi(
    useCallback(() => api.getSkills(), []),
    [],
  )

  const { data: coursework } = useApi(
    useCallback(() => api.getCoursework(), []),
    [],
  )

  if (!profile) return null

  const paragraphs = (profile.about_long || profile.about_short || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <div className="section">
      <div className="container-content">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow">
                <span className="h-px w-6 bg-accent" aria-hidden="true" />
                Background
              </p>
              <h1 className="mt-3 text-display font-bold text-ink">About</h1>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-8 space-y-5">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="prose-body text-pretty">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>

            {education?.length > 0 && (
              <Reveal delay={0.12}>
                <section className="mt-14 border-t border-line pt-10">
                  <h2 className="text-heading font-semibold text-ink">
                    Education
                  </h2>

                  <div className="mt-6 space-y-6">
                    {education.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <GraduationCap
                          className="mt-1 h-4 w-4 shrink-0 text-accent"
                          aria-hidden="true"
                        />
                        <div>
                          <h3 className="font-medium text-ink">{item.degree}</h3>
                          <p className="mt-1 text-sm text-ink-muted">
                            {item.institution}
                            {item.location && ` · ${item.location}`}
                          </p>
                          <p className="mt-2 font-mono text-xs text-ink-faint">
                            {item.date_range}
                            {item.status_note && ` · ${item.status_note}`}
                          </p>
                          {item.result && (
                            <p className="mt-1 font-mono text-xs text-ink-faint">
                              CGPA {item.result}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {coursework?.length > 0 && (
                    <div className="mt-8">
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                        Relevant coursework
                      </p>
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {coursework.map((subject) => (
                          <li key={subject.id} className="tag">
                            {subject.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              </Reveal>
            )}

            {skills?.length > 0 && (
              <Reveal delay={0.16}>
                <section className="mt-14 border-t border-line pt-10">
                  <h2 className="text-heading font-semibold text-ink">
                    Technical skills
                  </h2>

                  <dl className="mt-6 space-y-6">
                    {skills.map((category) => (
                      <div key={category.id}>
                        <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                          {category.name}
                        </dt>
                        <dd className="mt-3">
                          <ul className="flex flex-wrap gap-1.5">
                            {category.skills.map((skill) => (
                              <li
                                key={skill.id}
                                className="tag"
                                title={skill.level_display}
                              >
                                {skill.name}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </Reveal>
            )}

            <Reveal delay={0.2}>
              <div className="mt-14 border-t border-line pt-10">
                <Link to="/contact" className="btn-primary">
                  Get in touch
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={0.1}>
              <Spotlight className="card overflow-hidden">
                {profile.photo && (
                  <img
                    src={profile.photo}
                    alt={profile.display_name}
                    width={576}
                    height={576}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-cover"
                  />
                )}

                <div className="p-6">
                  <p className="font-medium text-ink">{profile.display_name}</p>
                  <p className="mt-1 text-sm text-ink-muted">{profile.title}</p>

                  {profile.location && (
                    <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-ink-faint">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {profile.location}
                    </p>
                  )}

                  {profile.resume && (
                    <a
                      href={profile.resume}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-secondary mt-6 w-full"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Download resume
                    </a>
                  )}
                </div>
              </Spotlight>
            </Reveal>
          </aside>
        </div>
      </div>
    </div>
  )
}
