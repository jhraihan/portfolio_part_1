import { Reveal } from './Reveal'

/** Eyebrow label, heading, and optional supporting line. */
export function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left'

  return (
    <Reveal className={`max-w-prose ${alignment}`}>
      {eyebrow && (
        <p className="eyebrow mb-4">
          <span className="h-px w-6 bg-accent" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2 className="text-heading-lg font-semibold text-ink">{title}</h2>
      {description && (
        <p className="prose-body mt-4 text-pretty">{description}</p>
      )}
    </Reveal>
  )
}
