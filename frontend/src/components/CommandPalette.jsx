import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  FileText,
  Github,
  Home,
  Layers,
  Linkedin,
  Mail,
  Moon,
  Search,
  Sun,
  User,
} from 'lucide-react'

/**
 * Keyboard-driven navigation, opened with Cmd/Ctrl+K.
 *
 * Actions are built from live data, so newly added projects appear without
 * touching this file.
 */
export function CommandPalette({ open, onClose, projects = [], profile, theme, onToggleTheme }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const actions = useMemo(() => {
    const go = (path) => () => {
      navigate(path)
      onClose()
    }
    const openExternal = (url) => () => {
      window.open(url, '_blank', 'noopener,noreferrer')
      onClose()
    }

    const items = [
      { id: 'home', label: 'Home', group: 'Navigation', Icon: Home, run: go('/') },
      { id: 'projects', label: 'Projects', group: 'Navigation', Icon: Layers, run: go('/projects') },
      { id: 'about', label: 'About', group: 'Navigation', Icon: User, run: go('/about') },
      { id: 'contact', label: 'Contact', group: 'Navigation', Icon: Mail, run: go('/contact') },
    ]

    projects.forEach((project) => {
      items.push({
        id: `project-${project.slug}`,
        label: project.title,
        hint: project.subtitle,
        group: 'Case studies',
        Icon: FileText,
        run: go(`/projects/${project.slug}`),
      })
    })

    items.push({
      id: 'theme',
      label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
      group: 'Actions',
      Icon: theme === 'dark' ? Sun : Moon,
      run: () => {
        onToggleTheme()
        onClose()
      },
    })

    if (profile?.github_url) {
      items.push({
        id: 'github',
        label: 'Open GitHub',
        group: 'Links',
        Icon: Github,
        run: openExternal(profile.github_url),
      })
    }
    if (profile?.linkedin_url) {
      items.push({
        id: 'linkedin',
        label: 'Open LinkedIn',
        group: 'Links',
        Icon: Linkedin,
        run: openExternal(profile.linkedin_url),
      })
    }
    if (profile?.email) {
      items.push({
        id: 'email',
        label: `Email ${profile.email}`,
        group: 'Links',
        Icon: Mail,
        run: () => {
          window.location.href = `mailto:${profile.email}`
          onClose()
        },
      })
    }

    return items
  }, [navigate, onClose, projects, profile, theme, onToggleTheme])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return actions.filter(
      (action) =>
        action.label.toLowerCase().includes(q) ||
        action.hint?.toLowerCase().includes(q) ||
        action.group.toLowerCase().includes(q),
    )
  }, [actions, query])

  // Reset when the palette opens.
  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      // Focus after the open transition so the caret lands reliably.
      const timer = setTimeout(() => inputRef.current?.focus(), 40)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Clamp the highlight when filtering shrinks the list.
  useEffect(() => {
    setActive((current) => Math.min(current, Math.max(results.length - 1, 0)))
  }, [results.length])

  // Keep the highlighted row in view during keyboard navigation. Guarded
  // because scrollIntoView is absent in some environments, and scrolling is
  // a convenience the palette must not depend on.
  useEffect(() => {
    const row = listRef.current?.querySelector('[data-active="true"]')
    if (typeof row?.scrollIntoView === 'function') {
      row.scrollIntoView({ block: 'nearest' })
    }
  }, [active])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Escape is bound at the document so it closes the palette regardless of
  // where focus currently sits.
  useEffect(() => {
    if (!open) return
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [open, onClose])

  // Escape is handled at the document level, above.
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActive((i) => (i + 1) % Math.max(results.length, 1))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActive((i) => (i - 1 + results.length) % Math.max(results.length, 1))
      } else if (event.key === 'Enter') {
        event.preventDefault()
        results[active]?.run()
      }
    },
    [results, active],
  )

  if (!open) return null

  let lastGroup = null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-canvas/70 backdrop-blur-sm"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Close command palette"
      />

      <div
        className="relative w-full max-w-xl overflow-hidden rounded-card border border-line-strong bg-surface shadow-2xl animate-fade-up"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects and pages…"
            className="w-full bg-transparent py-4 text-sm text-ink outline-none placeholder:text-ink-faint"
            aria-label="Search"
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-faint sm:block">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink-faint">
              No matches for “{query}”
            </p>
          ) : (
            results.map((action, index) => {
              const showGroup = action.group !== lastGroup
              lastGroup = action.group
              const isActive = index === active

              return (
                <div key={action.id}>
                  {showGroup && (
                    <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                      {action.group}
                    </p>
                  )}
                  <button
                    type="button"
                    data-active={isActive}
                    onClick={action.run}
                    onPointerMove={() => setActive(index)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isActive ? 'bg-elevated text-ink' : 'text-ink-muted'
                    }`}
                  >
                    <action.Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{action.label}</span>
                      {action.hint && (
                        <span className="block truncate text-xs text-ink-faint">
                          {action.hint}
                        </span>
                      )}
                    </span>
                    {isActive && (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-[10px] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-line px-1">↑</kbd>
            <kbd className="rounded border border-line px-1">↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-line px-1">↵</kbd>
            select
          </span>
        </div>
      </div>
    </div>
  )
}
