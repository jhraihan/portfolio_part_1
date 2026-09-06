import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import { Header } from '@/layouts/Header'
import { Footer } from '@/layouts/Footer'
import { CommandPalette } from '@/components/CommandPalette'
import { Home } from '@/pages/Home'
import { Projects } from '@/pages/Projects'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { About } from '@/pages/About'
import { Contact } from '@/pages/Contact'
import { NotFound } from '@/pages/NotFound'
import { useTheme } from '@/hooks/useTheme'
import { useApi } from '@/hooks/useApi'
import { api } from '@/services/api'

/** Resets scroll position on navigation, which client routing does not do. */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Profile and the project list are fetched once here and passed down: both
  // are needed by several pages and by the command palette, and neither
  // changes during a session.
  const { data: profile } = useApi(
    useCallback(() => api.getProfile(), []),
    [],
  )

  const { data: projects } = useApi(
    useCallback(() => api.getProjects(), []),
    [],
  )

  // Cmd/Ctrl+K opens the palette from anywhere.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const closePalette = useCallback(() => setPaletteOpen(false), [])

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        profile={profile}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<Home profile={profile} />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/about" element={<About profile={profile} />} />
          <Route path="/contact" element={<Contact profile={profile} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer profile={profile} />

      <CommandPalette
        open={paletteOpen}
        onClose={closePalette}
        projects={projects || []}
        profile={profile}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  )
}
