import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Download, Github, Linkedin, MapPin, Terminal } from 'lucide-react'

import { Magnetic } from '@/components/Magnetic'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useTypewriter } from '@/hooks/useTypewriter'

// What the typewriter cycles through. Every line names something actually
// built across the five projects, and the list spans both ends of the stack.
const ROTATING = [
  'REST APIs with Django & DRF',
  'React interfaces that stay fast',
  'role-based access control',
  'relational database schemas',
  'JWT authentication flows',
]

export function Hero({ profile }) {
  const reduced = usePrefersReducedMotion()
  const { text, isAnimating } = useTypewriter(ROTATING)

  if (!profile) return null

  const {
    display_name: displayName,
    title,
    hero_intro: heroIntro,
    location,
    availability,
    photo,
    resume,
    github_url: githubUrl,
    linkedin_url: linkedinUrl,
  } = profile

  const rise = (delay) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
        }

  return (
    <section className="relative overflow-hidden pt-14 pb-section sm:pt-20">
      {/* Backdrop: grid, radial mask, and three slow ambient glows in the
          accent hues. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-grid mask-fade-radial opacity-70" />
        <div className="absolute -top-40 right-[-15%] h-[34rem] w-[34rem] animate-drift rounded-full bg-accent/[0.10] blur-[130px]" />
        <div
          className="absolute bottom-0 left-[-10%] h-[28rem] w-[28rem] animate-drift rounded-full bg-violet/[0.08] blur-[120px]"
          style={{ animationDelay: '-9s' }}
        />
        <div
          className="absolute left-1/3 top-1/4 h-[20rem] w-[20rem] animate-drift rounded-full bg-green/[0.05] blur-[110px]"
          style={{ animationDelay: '-4s' }}
        />
      </div>

      <div className="container-content">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
          <div className="max-w-2xl">
            {availability && (
              <motion.div
                {...rise(0)}
                className="inline-flex items-center gap-2.5 rounded-full border border-accent/25 bg-accent/[0.06] px-3.5 py-1.5 font-mono text-[11px] text-ink-muted backdrop-blur-sm"
              >
                <span className="relative flex h-1.5 w-1.5">
                  {!reduced && (
                    <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent" />
                  )}
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                {availability}
              </motion.div>
            )}

            <motion.h1
              {...rise(0.07)}
              className="mt-7 text-hero font-extrabold leading-[0.98] tracking-[-0.04em] text-ink"
            >
              {displayName}
            </motion.h1>

            <motion.div
              {...rise(0.13)}
              className="mt-5 flex items-center gap-2.5 font-mono text-sm text-accent"
            >
              <Terminal className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="uppercase tracking-[0.16em]">{title}</span>
            </motion.div>

            {/* Typing line. The live region is polite so it does not interrupt
                a screen reader mid-sentence. */}
            <motion.p
              {...rise(0.19)}
              className="mt-7 min-h-[1.6em] text-heading font-medium text-ink"
            >
              <span className="text-ink-muted">I build </span>
              <span
                className={
                  reduced
                    ? 'text-accent'
                    : 'text-gradient-accent animate-gradient-pan'
                }
                aria-live="polite"
              >
                {text}
              </span>
              {isAnimating && (
                <span
                  className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-blink bg-accent"
                  aria-hidden="true"
                />
              )}
            </motion.p>

            {heroIntro && (
              <motion.p {...rise(0.25)} className="prose-body mt-6 max-w-xl text-pretty">
                {heroIntro}
              </motion.p>
            )}

            <motion.div {...rise(0.31)} className="mt-10 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link to="/projects" className="btn-primary group">
                  View projects
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Magnetic>

              <Magnetic>
                <Link to="/contact" className="btn-secondary">
                  Get in touch
                </Link>
              </Magnetic>

              {/* Rendered only once a resume file exists. */}
              {resume && (
                <a
                  href={resume}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-ghost group"
                >
                  <Download
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5"
                    aria-hidden="true"
                  />
                  Resume
                </a>
              )}
            </motion.div>

            <motion.div
              {...rise(0.37)}
              className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-faint"
            >
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {location}
                </span>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
                >
                  <Github className="h-3.5 w-3.5" aria-hidden="true" />
                  GitHub
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
                >
                  <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
                  LinkedIn
                </a>
              )}
            </motion.div>
          </div>

          {photo && (
            <motion.div
              {...rise(0.22)}
              className="relative mx-auto w-full max-w-sm lg:mx-0"
            >
              <div className={reduced ? '' : 'animate-float'}>
                {/* Accent bloom behind the portrait. */}
                <div
                  className="absolute -inset-4 rounded-[1.75rem] bg-gradient-to-br from-accent/20 via-violet/10 to-transparent blur-2xl"
                  aria-hidden="true"
                />

                <div className="relative">
                  {/* Corner brackets, drawn as borders rather than an image. */}
                  <span
                    className="absolute -left-2.5 -top-2.5 h-7 w-7 rounded-tl-lg border-l-2 border-t-2 border-accent/70"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute -bottom-2.5 -right-2.5 h-7 w-7 rounded-br-lg border-b-2 border-r-2 border-accent/70"
                    aria-hidden="true"
                  />

                  <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_70px_-30px_rgb(var(--accent)/0.5)]">
                    <img
                      src={photo}
                      alt={displayName}
                      width={608}
                      height={608}
                      fetchpriority="high"
                      decoding="async"
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
