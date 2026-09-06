import { Link } from 'react-router-dom'
import { Github, Linkedin, Mail, Code2 } from 'lucide-react'

const NAV_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Footer({ profile }) {
  const year = new Date().getFullYear()

  // Only links that actually exist are rendered.
  const socialLinks = [
    profile?.github_url && {
      href: profile.github_url,
      label: 'GitHub',
      Icon: Github,
    },
    profile?.linkedin_url && {
      href: profile.linkedin_url,
      label: 'LinkedIn',
      Icon: Linkedin,
    },
    profile?.leetcode_url && {
      href: profile.leetcode_url,
      label: 'LeetCode',
      Icon: Code2,
    },
    profile?.email && {
      href: `mailto:${profile.email}`,
      label: 'Email',
      Icon: Mail,
    },
  ].filter(Boolean)

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-content py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-semibold text-ink">
              {profile?.display_name || 'Portfolio'}
            </p>
            {profile?.title && (
              <p className="mt-1 text-sm text-ink-muted">{profile.title}</p>
            )}
            {profile?.location && (
              <p className="mt-3 font-mono text-xs text-ink-faint">
                {profile.location}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <nav aria-label="Footer">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                Pages
              </p>
              <ul className="mt-4 space-y-2.5">
                {NAV_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {socialLinks.length > 0 && (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                  Elsewhere
                </p>
                <ul className="mt-4 space-y-2.5">
                  {socialLinks.map(({ href, label, Icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target={href.startsWith('mailto:') ? undefined : '_blank'}
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-ink-faint">
            © {year} {profile?.full_name || 'Portfolio'}
          </p>
          <p className="font-mono text-xs text-ink-faint">
            Built with Django, DRF, and React
          </p>
        </div>
      </div>
    </footer>
  )
}
