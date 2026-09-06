import { Link } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'

import { Reveal } from '@/components/Reveal'

export function ContactCTA({ profile }) {
  return (
    <section className="section relative overflow-hidden border-t border-line bg-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-sm opacity-30"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[110px]"
        aria-hidden="true"
      />
      <div className="container-content relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center">Contact</p>

            <h2 className="mt-3 text-heading-lg font-semibold text-ink text-balance">
              Open to roles and interesting problems
            </h2>

            <p className="prose-body mx-auto mt-4 max-w-prose text-pretty">
              If you are hiring, or want to talk about something I have built,
              I would be glad to hear from you.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/contact" className="btn-primary">
                Send a message
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              {profile?.email && (
                <a href={`mailto:${profile.email}`} className="btn-secondary">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {profile.email}
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
