import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Send,
} from 'lucide-react'

import { Reveal } from '@/components/Reveal'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { api } from '@/services/api'

const EMPTY_FORM = { name: '', email: '', subject: '', message: '', website: '' }

const FIELDS = [
  { name: 'name', label: 'Name', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'subject', label: 'Subject', type: 'text', autoComplete: 'off' },
]

export function Contact({ profile }) {
  useDocumentTitle(
    'Contact',
    'Get in touch about roles, projects, or collaboration.',
  )

  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))

    // Clear a field's error as soon as the user edits it.
    if (fieldErrors[name]) {
      setFieldErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return

    setStatus('sending')
    setFieldErrors({})
    setFormError('')

    try {
      await api.sendContact(form)
      setStatus('success')
      setForm(EMPTY_FORM)
    } catch (error) {
      setStatus('error')

      if (error.status === 400 && error.data) {
        const { detail, ...fields } = error.data
        // DRF returns arrays of messages per field; show the first of each.
        const normalised = Object.fromEntries(
          Object.entries(fields).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : String(value),
          ]),
        )
        setFieldErrors(normalised)
        setFormError(
          Array.isArray(detail)
            ? detail[0]
            : detail ||
                (Object.keys(normalised).length
                  ? 'Please correct the highlighted fields.'
                  : 'Your message could not be sent.'),
        )
      } else if (error.status === 429) {
        setFormError(
          'Too many messages sent recently. Please try again later, or email me directly.',
        )
      } else {
        setFormError(error.message || 'Something went wrong. Please try again.')
      }
    }
  }

  const contactLinks = [
    profile?.email && {
      href: `mailto:${profile.email}`,
      label: profile.email,
      Icon: Mail,
      external: false,
    },
    profile?.github_url && {
      href: profile.github_url,
      label: 'GitHub',
      Icon: Github,
      external: true,
    },
    profile?.linkedin_url && {
      href: profile.linkedin_url,
      label: 'LinkedIn',
      Icon: Linkedin,
      external: true,
    },
  ].filter(Boolean)

  return (
    <div className="section">
      <div className="container-content">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-20">
          <div className="max-w-xl">
            <Reveal>
              <p className="eyebrow">Contact</p>
              <h1 className="mt-3 text-display font-bold text-ink">
                Get in touch
              </h1>
              <p className="prose-body mt-5 text-pretty">
                Whether it is a role, a project, or a question about something I
                have built — send a message and I will reply.
              </p>
            </Reveal>

            {status === 'success' ? (
              <Reveal>
                <div className="mt-10 rounded-card border border-accent/40 bg-accent/5 p-8 text-center">
                  <CheckCircle2
                    className="mx-auto h-8 w-8 text-accent"
                    aria-hidden="true"
                  />
                  <h2 className="mt-4 text-heading font-semibold text-ink">
                    Message sent
                  </h2>
                  <p className="prose-body mt-2 text-sm">
                    Thanks for reaching out. I will get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="btn-secondary mt-6"
                  >
                    Send another message
                  </button>
                </div>
              </Reveal>
            ) : (
              <Reveal delay={0.08}>
                <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate>
                  {formError && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-lg border border-accent/40 bg-accent/5 px-4 py-3"
                    >
                      <AlertCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      <p className="text-sm text-ink">{formError}</p>
                    </div>
                  )}

                  {FIELDS.map((field) => (
                    <div key={field.name}>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium text-ink"
                      >
                        {field.label}
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        value={form[field.name]}
                        onChange={handleChange}
                        required
                        autoComplete={field.autoComplete}
                        aria-invalid={Boolean(fieldErrors[field.name])}
                        aria-describedby={
                          fieldErrors[field.name]
                            ? `${field.name}-error`
                            : undefined
                        }
                        className={`mt-2 w-full rounded-lg border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                          fieldErrors[field.name]
                            ? 'border-accent'
                            : 'border-line focus:border-accent'
                        }`}
                      />
                      {fieldErrors[field.name] && (
                        <p
                          id={`${field.name}-error`}
                          className="mt-1.5 text-xs text-accent"
                        >
                          {fieldErrors[field.name]}
                        </p>
                      )}
                    </div>
                  ))}

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-ink"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={form.message}
                      onChange={handleChange}
                      required
                      aria-invalid={Boolean(fieldErrors.message)}
                      aria-describedby={
                        fieldErrors.message ? 'message-error' : undefined
                      }
                      className={`mt-2 w-full resize-y rounded-lg border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                        fieldErrors.message
                          ? 'border-accent'
                          : 'border-line focus:border-accent'
                      }`}
                    />
                    {fieldErrors.message && (
                      <p id="message-error" className="mt-1.5 text-xs text-accent">
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>

                  {/* Honeypot: hidden from users, irresistible to bots. */}
                  <div className="absolute left-[-9999px]" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      value={form.website}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {status === 'sending' ? (
                      <>
                        <span
                          className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                          aria-hidden="true"
                        />
                        Sending
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" aria-hidden="true" />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              </Reveal>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={0.12}>
              <div className="card p-6">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                  Direct
                </h2>

                <ul className="mt-5 space-y-3">
                  {contactLinks.map(({ href, label, Icon, external }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noreferrer noopener' : undefined}
                        className="inline-flex items-center gap-2.5 break-all text-sm text-ink-muted transition-colors hover:text-ink"
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>

                {profile?.location && (
                  <p className="mt-6 inline-flex items-center gap-2 border-t border-line pt-5 font-mono text-xs text-ink-faint">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {profile.location}
                  </p>
                )}

                {profile?.availability && (
                  <p className="mt-3 text-sm text-ink-muted">
                    {profile.availability}
                  </p>
                )}
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </div>
  )
}
