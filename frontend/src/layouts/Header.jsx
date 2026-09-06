import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'

import { ThemeToggle } from '@/components/ThemeToggle'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Header({ theme, onToggleTheme, profile, onOpenPalette }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMac, setIsMac] = useState(false)
  const location = useLocation()
  const progress = useScrollProgress()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent))
  }, [])

  // Close the mobile menu on navigation.
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Prevent background scrolling while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  // Escape closes the menu.
  useEffect(() => {
    if (!isMenuOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  const initials = (profile?.display_name || 'JHR')
    .split(' ')
    .filter((part) => /^[A-Za-z]/.test(part))
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        isScrolled
          ? 'border-line bg-canvas/80 backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="container-content flex h-16 items-center justify-between gap-6">
        <Link
          to="/"
          className="group flex items-center gap-2.5 font-semibold text-ink"
          aria-label="Home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent font-mono text-xs font-bold text-white transition-transform duration-300 group-hover:scale-105">
            {initials}
          </span>
          <span className="hidden text-sm sm:inline">
            {profile?.display_name || 'Portfolio'}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {/* Active indicator, drawn under the label. */}
                  {isActive && (
                    <span
                      className="absolute inset-x-3 -bottom-px h-px bg-accent"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Search trigger. Hidden on small screens, where there is no
              keyboard shortcut to advertise. */}
          <button
            type="button"
            onClick={onOpenPalette}
            className="hidden items-center gap-2 rounded-lg border border-line bg-surface/60 px-2.5 py-1.5 text-xs text-ink-faint transition-colors hover:border-line-strong hover:text-ink-muted sm:flex"
            aria-label="Open command palette"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <kbd className="font-mono text-[10px]">{isMac ? '⌘' : 'Ctrl'}K</kbd>
          </button>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:text-ink md:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Reading progress, only once the page has actually been scrolled. */}
      <div
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent transition-opacity duration-300"
        style={{ transform: `scaleX(${progress})`, opacity: isScrolled ? 1 : 0 }}
        aria-hidden="true"
      />

      {isMenuOpen && (
        <nav
          id="mobile-menu"
          className="border-t border-line bg-canvas md:hidden"
          aria-label="Mobile"
        >
          <div className="container-content flex flex-col py-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-3 text-sm transition-colors ${
                    isActive ? 'text-accent' : 'text-ink-muted'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
